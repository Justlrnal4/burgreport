import unittest
from unittest.mock import patch

import main
from services import price_defense
from tests.asgi_client import get


CLIMAT = {
    "name": "La Tâche",
    "village": "Vosne-Romanée",
    "cote": "Côte de Nuits",
    "grape": "Pinot Noir",
    "size_ha": 6.1,
    "is_monopole": True,
}
VINTAGE_RATING = {"year": 2019, "stars": 5, "label": "Exceptional", "note": "Aromatic, structured, profound"}


class BuildDefenseTests(unittest.TestCase):
    def test_full_data_produces_grounded_summary(self):
        price_data = {
            "avg_price_usd": 3000,
            "min_price_usd": 425,
            "max_price_usd": 3500,
            "sources": ["https://www.klwines.com/a", "https://www.wine.com/b"],
        }
        quality = {"label": "Limited data", "confidence": "low"}
        d = price_defense.build_defense("La Tâche", 2019, CLIMAT, price_data, VINTAGE_RATING, quality)

        self.assertIn("La Tâche", d["headline"])
        self.assertEqual(d["sources"], price_data["sources"])
        # Climat, vintage, and price each contribute a point with provenance.
        bases = [p["basis"] for p in d["points"]]
        self.assertEqual(bases, ["reference", "vintage reference", "web-sourced"])
        self.assertIn("monopole", d["summary"])
        self.assertIn("Exceptional", d["summary"])
        self.assertIn("$425", d["summary"])
        self.assertIn("2 merchant listings", d["summary"])
        self.assertTrue(d["summary"].endswith(price_defense.CAVEAT))

    def test_unsourced_single_point_is_honest(self):
        # The fixed La Tâche case: a price with no merchant source.
        price_data = {"avg_price_usd": 3840, "min_price_usd": None, "max_price_usd": None, "sources": []}
        quality = {"label": "Unsourced estimate", "confidence": "low"}
        d = price_defense.build_defense("La Tâche", 2019, CLIMAT, price_data, VINTAGE_RATING, quality)

        self.assertIn("around $3,840", d["summary"])
        self.assertIn("Unsourced estimate", d["summary"])
        self.assertEqual(d["sources"], [])
        # No fabricated source count ("... across N merchant listings") when sources is empty.
        price_point = next(p["text"] for p in d["points"] if p["basis"] == "web-sourced")
        self.assertNotIn("across", price_point)

    def test_no_price_states_it_plainly(self):
        d = price_defense.build_defense("Montrachet", None, {"name": "Montrachet"}, {"avg_price_usd": None}, None, {})
        self.assertIn("No web-sourced price was found", d["summary"])

    def test_missing_vintage_rating_omits_vintage_point(self):
        d = price_defense.build_defense("La Tâche", 2019, CLIMAT, {"avg_price_usd": 3000, "sources": []}, None, {})
        self.assertNotIn("vintage reference", [p["basis"] for p in d["points"]])

    def test_never_fabricates_unavailable_dimensions(self):
        d = price_defense.build_defense("La Tâche", 2019, CLIMAT,
                                        {"avg_price_usd": 3000, "sources": []}, VINTAGE_RATING, {})
        text = d["summary"].lower()
        for forbidden in ("critic", "score", "wine-searcher", "trend", "comparable"):
            self.assertNotIn(forbidden, text)


class SearchDefenseIntegrationTests(unittest.TestCase):
    @patch("routers.search.supabase_client.log_search")
    @patch("routers.search.supabase_client.get_vintage_rating")
    @patch("routers.search.openai_search.get_wine_price")
    @patch("routers.search.supabase_client.get_cached_price")
    @patch("routers.search.supabase_client.get_grand_cru")
    def test_search_response_carries_defense(
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
            "sources": ["https://www.klwines.com/a", "https://www.wine.com/b"],
            "confidence": "unavailable",
            "data_source": "openai_web_search",
        }
        get_vintage_rating.return_value = VINTAGE_RATING

        body = get(main.app, "/api/search", params={"wine_name": "La Tache", "vintage": 2019}).json()

        self.assertIn("defense", body)
        self.assertIn("La Tâche", body["defense"]["headline"])
        self.assertTrue(body["defense"]["summary"].endswith(price_defense.CAVEAT))
        self.assertEqual(len(body["defense"]["sources"]), 2)


if __name__ == "__main__":
    unittest.main()
