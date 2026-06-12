import unittest
from unittest.mock import patch

import main
from services import price_quality
from tests.asgi_client import get


class CleanSourceUrlTests(unittest.TestCase):
    def test_unwraps_markdown_and_strips_utm(self):
        raw = "([cremantb.com](https://www.cremantb.com/product/x?utm_source=openai))"
        self.assertEqual(
            price_quality.clean_source_url(raw),
            "https://www.cremantb.com/product/x",
        )

    def test_keeps_non_utm_query_params(self):
        raw = "https://shop.example.com/wine?id=42&utm_medium=email"
        self.assertEqual(
            price_quality.clean_source_url(raw),
            "https://shop.example.com/wine?id=42",
        )

    def test_returns_none_for_junk(self):
        self.assertIsNone(price_quality.clean_source_url(""))
        self.assertIsNone(price_quality.clean_source_url("not a url"))
        self.assertIsNone(price_quality.clean_source_url(None))


class SanitizePriceDataTests(unittest.TestCase):
    def test_self_referential_source_is_dropped(self):
        data = price_quality.sanitize_price_data({
            "sources": ["([burgreport.com](https://burgreport.com/?utm_source=openai))"],
        })
        self.assertEqual(data["sources"], [])

    def test_fabricated_merchant_count_dropped_when_unsupported(self):
        # The La Tâche failure case: 42 merchants claimed, only a self-citing source.
        data = price_quality.sanitize_price_data({
            "avg_price_usd": 3840,
            "min_price_usd": 3840,
            "max_price_usd": 3840,
            "merchant_count": 42,
            "sources": ["([burgreport.com](https://burgreport.com/?utm_source=openai))"],
        })
        self.assertIsNone(data["merchant_count"])
        self.assertEqual(data["sources"], [])
        # Fake zero-spread band collapses to the single point estimate.
        self.assertEqual(data["avg_price_usd"], 3840)
        self.assertIsNone(data["min_price_usd"])
        self.assertIsNone(data["max_price_usd"])

    def test_merchant_count_kept_when_corroborated(self):
        data = price_quality.sanitize_price_data({
            "merchant_count": 2,
            "sources": [
                "https://www.klwines.com/a",
                "https://www.wine.com/b",
            ],
        })
        self.assertEqual(data["merchant_count"], 2)
        self.assertEqual(len(data["sources"]), 2)

    def test_merchant_count_capped_to_distinct_domains(self):
        data = price_quality.sanitize_price_data({
            "merchant_count": 9,
            "sources": [
                "https://www.klwines.com/a",
                "https://www.klwines.com/b",  # same domain → one merchant
            ],
        })
        self.assertIsNone(data["merchant_count"])
        self.assertEqual(len(data["sources"]), 1)  # deduped by domain

    def test_real_spread_is_preserved(self):
        # The Chambertin 2021 good case must pass through untouched.
        data = price_quality.sanitize_price_data({
            "avg_price_usd": 3000,
            "min_price_usd": 425,
            "max_price_usd": 3500,
            "merchant_count": None,
            "sources": [
                "https://www.vinsetmillesimes.com/en/x?utm_source=openai",
                "https://www.millesima-usa.com/y?utm_source=openai",
            ],
        })
        self.assertEqual(data["avg_price_usd"], 3000)
        self.assertEqual(data["min_price_usd"], 425)
        self.assertEqual(data["max_price_usd"], 3500)
        self.assertTrue(all("utm_source" not in s for s in data["sources"]))

    def test_implausible_low_price_nulled(self):
        data = price_quality.sanitize_price_data({
            "avg_price_usd": 1,
            "min_price_usd": 1,
            "max_price_usd": 1,
            "sources": [],
        })
        self.assertIsNone(data["avg_price_usd"])

    def test_orphan_bounds_dropped_when_average_floored_away(self):
        # Real cached junk: avg $1 / max $3 are parsing artifacts; min $425 is left
        # orphaned. With no average, the band must not survive.
        data = price_quality.sanitize_price_data({
            "avg_price_usd": 1,
            "min_price_usd": 425,
            "max_price_usd": 3,
            "sources": [],
        })
        self.assertIsNone(data["avg_price_usd"])
        self.assertIsNone(data["min_price_usd"])
        self.assertIsNone(data["max_price_usd"])

    def test_is_idempotent(self):
        raw = {
            "avg_price_usd": 3840,
            "min_price_usd": 3840,
            "max_price_usd": 3840,
            "merchant_count": 42,
            "sources": ["([burgreport.com](https://burgreport.com/?utm_source=openai))"],
        }
        once = price_quality.sanitize_price_data(dict(raw))
        twice = price_quality.sanitize_price_data(dict(once))
        self.assertEqual(once, twice)


class SearchSanitizationIntegrationTests(unittest.TestCase):
    @patch("routers.search.supabase_client.log_search")
    @patch("routers.search.supabase_client.get_vintage_rating")
    @patch("routers.search.openai_search.get_wine_price")
    @patch("routers.search.supabase_client.get_cached_price")
    @patch("routers.search.supabase_client.get_grand_cru")
    def test_cache_hit_junk_row_is_scrubbed_end_to_end(
        self,
        get_grand_cru,
        get_cached_price,
        get_wine_price,
        get_vintage_rating,
        log_search,
    ):
        get_grand_cru.return_value = {"id": "la-tache", "slug": "la-tache", "name": "La Tâche"}
        get_cached_price.return_value = {
            "avg_price_usd": 3840,
            "min_price_usd": 3840,
            "max_price_usd": 3840,
            "merchant_count": 42,
            "sources": ["([burgreport.com](https://burgreport.com/?utm_source=openai))"],
            "confidence": "unavailable",
            "data_source": "openai_web_search",
        }
        get_vintage_rating.return_value = None

        response = get(main.app, "/api/search", params={"wine_name": "La Tache", "vintage": 2019})
        body = response.json()

        self.assertEqual(response.status_code, 200)
        # Point estimate survives; fabricated band + count + self-citing source do not.
        self.assertEqual(body["price"]["avg_usd"], 3840)
        self.assertIsNone(body["price"]["min_usd"])
        self.assertIsNone(body["price"]["max_usd"])
        self.assertIsNone(body["price"]["merchant_count"])
        self.assertEqual(body["price"]["sources"], [])
        # Truth model: average stays live, the fake bounds become unavailable.
        self.assertEqual(body["truth"]["price"]["average"]["status"], "live")
        self.assertEqual(body["truth"]["price"]["low"]["status"], "unavailable")
        self.assertEqual(body["truth"]["price"]["high"]["status"], "unavailable")
        get_wine_price.assert_not_called()


if __name__ == "__main__":
    unittest.main()
