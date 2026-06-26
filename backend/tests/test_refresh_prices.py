import json
import os
import tempfile
import unittest
from unittest.mock import patch

import refresh_prices


class RefreshPricesTests(unittest.TestCase):
    def test_select_jobs_rotates_with_state_file(self):
        jobs = [("A", 2019), ("B", 2019), ("C", 2019)]
        with tempfile.TemporaryDirectory() as temp_dir:
            state_file = os.path.join(temp_dir, "state.json")
            with open(state_file, "w", encoding="utf-8") as handle:
                json.dump({"next_index": 1}, handle)

            selected, next_index = refresh_prices._select_jobs(jobs, 2, state_file)

        self.assertEqual(selected, [("B", 2019), ("C", 2019)])
        self.assertEqual(next_index, 0)

    def test_parse_wines_keeps_reference_order(self):
        wines = refresh_prices._parse_wines("La Tache, Chambertin")

        self.assertEqual(wines, ["Chambertin", "La Tâche"])


class FetchTests(unittest.TestCase):
    @patch("refresh_prices.tavily_search.get_wine_offers")
    def test_auto_uses_aggregation_with_offer_count(self, get_offers):
        # The refresh must cache the SAME offer-counted shape the live search
        # produces, or cache hits read "too thin" despite real listings.
        get_offers.return_value = [
            {"price": 1000, "url": "https://klwines.com/a"},
            {"price": 1200, "url": "https://wine.com/b"},
            {"price": 1400, "url": "https://other.com/c"},
        ]
        pd = refresh_prices._fetch("auto", None, "Chambertin", 2020)
        self.assertEqual(pd["source"], "tavily_aggregated")
        self.assertEqual(pd["offer_count"], 3)
        self.assertEqual(pd["avg_price_usd"], 1200)  # median

    @patch("refresh_prices.openai_search.get_wine_price")
    @patch("refresh_prices.tavily_search.get_wine_offers")
    def test_auto_falls_back_to_openai_when_no_offers(self, get_offers, get_price):
        get_offers.return_value = []
        get_price.return_value = {"avg_price_usd": 500, "source": "openai_web_search"}
        pd = refresh_prices._fetch("auto", None, "Chambertin", 2020)
        get_price.assert_called_once()
        self.assertEqual(pd["source"], "openai_web_search")


if __name__ == "__main__":
    unittest.main()
