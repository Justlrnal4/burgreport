"""
Honesty-regression gate — the moat in test form.

These assert the invariants that make BurgReport's truth model real: a web-sourced
price is never "live", critic data is never produced or persisted, the forward-
history trail never records a non-price, and the verdict refuses to call thin data.
If any of these fail, the one thing competitors can't copy has silently broken.
Treat them as BLOCKING.
"""

import unittest
from unittest.mock import patch

import main
from services import supabase_client, verdict
from tests.asgi_client import get


def _walk_statuses(node):
    """Yield every 'status' value anywhere in a nested dict/list (the truth block)."""
    if isinstance(node, dict):
        if "status" in node and isinstance(node["status"], str):
            yield node["status"]
        for v in node.values():
            yield from _walk_statuses(v)
    elif isinstance(node, list):
        for item in node:
            yield from _walk_statuses(item)


class WebSourcedPriceIsNeverLive(unittest.TestCase):
    @patch("routers.search.supabase_client.log_search")
    @patch("routers.search.supabase_client.get_vintage_rating")
    @patch("routers.search.openai_search.get_wine_price")
    @patch("routers.search.supabase_client.get_cached_price")
    @patch("routers.search.supabase_client.get_grand_cru")
    def test_no_field_serializes_status_live(self, get_grand_cru, get_cached_price, get_wine_price, get_vintage_rating, log_search):
        get_grand_cru.return_value = {"id": "la-tache", "slug": "la-tache", "name": "La Tâche", "size_ha": 6.1, "is_monopole": True}
        get_cached_price.return_value = {
            "avg_price_usd": 2500,
            "min_price_usd": 1800,
            "max_price_usd": 3500,
            "sources": ["https://a.example.com/x", "https://b.example.com/y", "https://c.example.com/z"],
            "confidence": "moderate",
            "data_source": "openai_web_search",
        }
        get_vintage_rating.return_value = {"label": "Exceptional", "stars": 5}

        body = get(main.app, "/api/search", params={"wine_name": "La Tache", "vintage": 2019}).json()

        statuses = set(_walk_statuses(body.get("truth", {})))
        self.assertEqual(body["truth"]["price"]["average"]["status"], "estimated")
        self.assertNotIn("live", statuses, f"a field serialized status='live' (reserved for licensed feeds): {statuses}")
        # critic data must never reach the response
        self.assertIsNone(body["price"]["critic_score"])
        self.assertIsNone(body["price"]["critic_name"])


class CacheWriteStripsForbiddenData(unittest.TestCase):
    def test_build_cache_row_never_persists_critic(self):
        row = supabase_client.build_cache_row("la-tache", 2019, {
            "avg_price_usd": 2500,
            "critic_score": 99,            # provider tried to hand us a score
            "critic_name": "Some Critic",  # and a name
            "sources": ["https://a.example.com/x"],
            "source": "openai_web_search",
        })
        self.assertIsNone(row["critic_score"])
        self.assertIsNone(row["critic_name"])
        # No history-like field is smuggled onto the cache row.
        self.assertNotIn("history", row)


class ForwardHistoryNeverRecordsNonPrice(unittest.TestCase):
    def test_history_row_is_none_without_price(self):
        self.assertIsNone(supabase_client.build_history_row("la-tache", 2019, {"avg_price_usd": None, "sources": []}))

    def test_history_row_carries_source_count(self):
        row = supabase_client.build_history_row("la-tache", 2019, {
            "avg_price_usd": 2500,
            "sources": ["https://a.example.com/x", "https://b.example.com/y"],
            "source": "openai_web_search",
        })
        self.assertEqual(row["source_count"], 2)
        self.assertIsNone(row.get("critic_score"))


class VerdictRefusesThinData(unittest.TestCase):
    def test_thin_data_is_never_directional(self):
        v = verdict.build_verdict("La Tâche", 2019, {"name": "La Tâche"},
                                  {"avg_price_usd": 2500, "sources": ["https://a.example.com/x"]},
                                  None, {"score": 1, "confidence": "low"}, quoted_price=9000)
        self.assertEqual(v["stance"], "insufficient")


if __name__ == "__main__":
    unittest.main()
