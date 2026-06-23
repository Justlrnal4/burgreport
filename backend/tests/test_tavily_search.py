import os
import unittest
from unittest.mock import Mock, patch

from services import tavily_search


class TavilySearchTests(unittest.TestCase):
    def setUp(self):
        self.original_key = os.environ.pop("TAVILY_API_KEY", None)

    def tearDown(self):
        if self.original_key is not None:
            os.environ["TAVILY_API_KEY"] = self.original_key
        else:
            os.environ.pop("TAVILY_API_KEY", None)

    def test_missing_key_returns_unavailable_shape(self):
        result = tavily_search.get_wine_price("La Tache", 2019)

        self.assertEqual(result["source"], "tavily_missing_key")
        self.assertIsNone(result["avg_price_usd"])
        self.assertEqual(result["sources"], [])

    def test_extracts_direct_usd_prices_from_matching_results(self):
        results = [
            {
                "title": "2019 La Tache Grand Cru",
                "url": "https://www.wine-searcher.com/example",
                "content": "Retail offers list 2019 La Tache bottles at $5,500 and USD 6,000.",
            },
            {
                "title": "2018 La Tache Grand Cru",
                "url": "https://www.wine.com/example",
                "content": "Different vintage at $4,000.",
            },
            {
                "title": "2019 Chambertin Grand Cru",
                "url": "https://www.klwines.com/example",
                "content": "Wrong climat at $900.",
            },
        ]

        prices, sources, merchant_count = tavily_search._prices_from_results(results, "La Tache", 2019)

        self.assertEqual(prices, [5500.0, 6000.0])
        self.assertEqual(sources, ["https://www.wine-searcher.com/example"])
        self.assertEqual(merchant_count, 1)

    @patch("services.tavily_search.httpx.post")
    def test_successful_search_returns_price_shape(self, post):
        os.environ["TAVILY_API_KEY"] = "tvly-test"
        response = Mock()
        response.status_code = 200
        response.json.return_value = {
            "results": [
                {
                    "title": "2019 La Tache Grand Cru",
                    "url": "https://www.wine-searcher.com/example",
                    "content": "Merchant snippet shows 2019 La Tache at $5,500.",
                }
            ]
        }
        post.return_value = response

        result = tavily_search.get_wine_price("La Tache", 2019)

        self.assertEqual(result["source"], "tavily_search_snippets")
        # A single observation is a point estimate, not a range: the quality layer
        # keeps the average and nulls the equal min/max so the UI cannot present a
        # zero-spread "$5,500 – $5,500" band (see services.price_quality).
        self.assertEqual(result["avg_price_usd"], 5500.0)
        self.assertIsNone(result["min_price_usd"])
        self.assertIsNone(result["max_price_usd"])


if __name__ == "__main__":
    unittest.main()
