import unittest

from services import price_aggregate as pa


class AggregateObservationsTests(unittest.TestCase):
    def test_empty_returns_no_price(self):
        a = pa.aggregate_observations([])
        self.assertIsNone(a["avg_price_usd"])
        self.assertEqual(a["offer_count"], 0)
        self.assertEqual(a["sources"], [])

    def test_median_and_band_from_offers(self):
        obs = [{"price": p, "url": f"https://m{i}.example.com/x"} for i, p in enumerate([100, 200, 300])]
        a = pa.aggregate_observations(obs)
        self.assertEqual(a["avg_price_usd"], 200)  # median, robust to skew
        self.assertEqual(a["min_price_usd"], 100)
        self.assertEqual(a["max_price_usd"], 300)
        self.assertEqual(a["offer_count"], 3)
        self.assertEqual(a["merchant_count"], 3)

    def test_implausible_low_offer_dropped(self):
        obs = [{"price": 5, "url": "https://a.com/x"}, {"price": 1000, "url": "https://b.com/y"}]
        a = pa.aggregate_observations(obs)
        self.assertEqual(a["offer_count"], 1)  # $5 is below the bottle-price floor
        self.assertEqual(a["avg_price_usd"], 1000)

    def test_single_value_has_no_fake_band(self):
        obs = [{"price": 500, "url": "https://klwines.com/a"}, {"price": 500, "url": "https://klwines.com/b"}]
        a = pa.aggregate_observations(obs)
        self.assertEqual(a["avg_price_usd"], 500)
        self.assertIsNone(a["min_price_usd"])
        self.assertIsNone(a["max_price_usd"])
        self.assertEqual(a["merchant_count"], 1)  # same domain deduped

    def test_distinct_domains_counted_once_but_offers_counted_all(self):
        obs = [
            {"price": 100, "url": "https://www.klwines.com/a"},
            {"price": 120, "url": "https://klwines.com/b"},  # same domain after www strip
            {"price": 140, "url": "https://other.com/c"},
        ]
        a = pa.aggregate_observations(obs)
        self.assertEqual(a["offer_count"], 3)   # aggregator offers all count as evidence
        self.assertEqual(a["merchant_count"], 2)  # klwines.com + other.com

    def test_far_outlier_trimmed_real_spread_survives(self):
        prices = [400, 450, 500, 550, 600, 50000]  # one parsing artifact
        obs = [{"price": p, "url": f"https://m{i}.example.com"} for i, p in enumerate(prices)]
        a = pa.aggregate_observations(obs)
        self.assertLess(a["max_price_usd"], 50000)  # artifact dropped
        self.assertGreaterEqual(a["min_price_usd"], 400)  # real spread kept


if __name__ == "__main__":
    unittest.main()
