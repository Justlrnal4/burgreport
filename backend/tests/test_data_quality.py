import unittest
from datetime import datetime, timezone, timedelta
from unittest.mock import patch

import main
from services import data_quality
from tests.asgi_client import get


class AssessQualityTests(unittest.TestCase):
    def test_no_price_is_unavailable(self):
        q = data_quality.assess_quality({"avg_price_usd": None, "sources": []})
        self.assertEqual(q["tier"], "none")
        self.assertEqual(q["confidence"], "unavailable")

    def test_unsourced_price_is_lowest_tier(self):
        # The fixed La Tâche case: a price with no merchant source survives.
        q = data_quality.assess_quality({
            "avg_price_usd": 3840,
            "min_price_usd": None,
            "max_price_usd": None,
            "sources": [],
        })
        self.assertEqual(q["tier"], "unsourced")
        self.assertEqual(q["score"], 0)
        self.assertEqual(q["confidence"], "low")
        self.assertEqual(q["factors"]["sourceCount"], 0)
        self.assertTrue(q["factors"]["isSinglePoint"])

    def test_single_source(self):
        q = data_quality.assess_quality({
            "avg_price_usd": 1000,
            "min_price_usd": 1000,
            "max_price_usd": 1000,
            "sources": ["https://www.klwines.com/a"],
        })
        self.assertEqual(q["tier"], "single")
        self.assertEqual(q["confidence"], "low")

    def test_multiple_sources_narrow_spread_is_moderate(self):
        q = data_quality.assess_quality({
            "avg_price_usd": 1000,
            "min_price_usd": 900,
            "max_price_usd": 1100,
            "sources": [
                "https://www.klwines.com/a",
                "https://www.wine.com/b",
                "https://www.zachys.com/c",
            ],
        })
        self.assertEqual(q["tier"], "multiple")
        self.assertEqual(q["confidence"], "moderate")
        self.assertEqual(q["factors"]["spreadPct"], 20.0)

    def test_wide_spread_caps_confidence_to_low(self):
        # Chambertin-like: many sources but a 100%+ spread → still only "low".
        q = data_quality.assess_quality({
            "avg_price_usd": 3000,
            "min_price_usd": 425,
            "max_price_usd": 3500,
            "sources": [f"https://merchant{i}.com/x" for i in range(7)],
        })
        self.assertEqual(q["tier"], "multiple")
        self.assertEqual(q["confidence"], "low")
        self.assertGreater(q["factors"]["spreadPct"], data_quality.WIDE_SPREAD_PCT)

    def test_stale_cache_caps_confidence_to_low(self):
        old = (datetime.now(timezone.utc) - timedelta(days=10)).isoformat()
        q = data_quality.assess_quality({
            "avg_price_usd": 1000,
            "min_price_usd": 900,
            "max_price_usd": 1100,
            "sources": [
                "https://www.klwines.com/a",
                "https://www.wine.com/b",
                "https://www.zachys.com/c",
            ],
            "fetched_at": old,
        })
        self.assertTrue(q["factors"]["isStale"])
        self.assertEqual(q["confidence"], "low")

    def test_confidence_never_exceeds_moderate(self):
        # Even a perfect-looking result must not read as authoritative/high.
        q = data_quality.assess_quality({
            "avg_price_usd": 1000,
            "min_price_usd": 990,
            "max_price_usd": 1010,
            "sources": [f"https://merchant{i}.com/x" for i in range(12)],
        })
        self.assertIn(q["confidence"], ("low", "moderate"))
        self.assertNotEqual(q["confidence"], "high")


class SearchQualityIntegrationTests(unittest.TestCase):
    @patch("routers.search.supabase_client.log_search")
    @patch("routers.search.supabase_client.get_vintage_rating")
    @patch("routers.search.openai_search.get_wine_price")
    @patch("routers.search.supabase_client.get_cached_price")
    @patch("routers.search.supabase_client.get_grand_cru")
    def test_search_response_carries_quality_block(
        self,
        get_grand_cru,
        get_cached_price,
        get_wine_price,
        get_vintage_rating,
        log_search,
    ):
        get_grand_cru.return_value = {"id": "la-tache", "slug": "la-tache", "name": "La Tâche"}
        get_cached_price.return_value = {
            "avg_price_usd": 3000,
            "min_price_usd": 900,
            "max_price_usd": 1100,
            "sources": [
                "https://www.klwines.com/a",
                "https://www.wine.com/b",
                "https://www.zachys.com/c",
            ],
            "confidence": "unavailable",
            "data_source": "openai_web_search",
        }
        get_vintage_rating.return_value = None

        body = get(main.app, "/api/search", params={"wine_name": "La Tache", "vintage": 2019}).json()

        self.assertIn("quality", body["truth"])
        self.assertEqual(body["truth"]["quality"]["tier"], "multiple")
        # Same object mirrored into the legacy price block for existing card code.
        self.assertEqual(body["price"]["data_quality"], body["truth"]["quality"])


if __name__ == "__main__":
    unittest.main()
