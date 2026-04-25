import os
import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient

import main
from services import openai_search, reference_data


class TruthModelFoundationTests(unittest.TestCase):
    def setUp(self):
        self.original_key = os.environ.pop("OPENAI_API_KEY", None)
        openai_search._client = None

    def tearDown(self):
        if self.original_key is not None:
            os.environ["OPENAI_API_KEY"] = self.original_key
        else:
            os.environ.pop("OPENAI_API_KEY", None)
        openai_search._client = None

    def test_health_returns_200(self):
        client = TestClient(main.app)
        response = client.get("/health")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "ok")

    def test_cors_defaults_do_not_include_wildcard(self):
        origins = main.get_cors_origins("")

        self.assertNotIn("*", origins)
        self.assertIn("http://localhost:3000", origins)

    def test_cors_parses_env_values_without_wildcard_default(self):
        origins = main.get_cors_origins(" http://localhost:3000, https://burgreport.com/ ")

        self.assertEqual(origins, ["http://localhost:3000", "https://burgreport.com"])

    def test_reference_dataset_has_33_climats_and_required_aliases(self):
        self.assertEqual(len(reference_data.list_climats()), 33)
        self.assertEqual(reference_data.find_climat("La Tache")["name"], "La Tâche")
        self.assertEqual(reference_data.find_climat("Romanee Conti")["name"], "Romanée-Conti")
        self.assertEqual(reference_data.find_climat("Romanee-Conti")["name"], "Romanée-Conti")
        self.assertEqual(reference_data.find_climat("Echezeaux")["name"], "Échézeaux")
        self.assertEqual(reference_data.find_climat("Batard Montrachet")["name"], "Bâtard-Montrachet")
        self.assertEqual(reference_data.find_climat("Clos de Beze")["name"], "Chambertin-Clos de Bèze")

    @patch("routers.search.supabase_client.log_search")
    @patch("routers.search.supabase_client.get_vintage_rating")
    @patch("routers.search.openai_search.get_wine_price")
    @patch("routers.search.supabase_client.get_cached_price")
    @patch("routers.search.supabase_client.get_grand_cru")
    def test_search_returns_reference_and_unavailable_truth_fields(
        self,
        get_grand_cru,
        get_cached_price,
        get_wine_price,
        get_vintage_rating,
        log_search,
    ):
        get_grand_cru.return_value = None
        get_cached_price.return_value = None
        get_wine_price.return_value = openai_search._empty_price("openai_missing_key")
        get_vintage_rating.return_value = None

        client = TestClient(main.app)
        response = client.get("/api/search", params={"wine_name": "La Tache", "vintage": 2019})
        body = response.json()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(body["climat"]["name"], "La Tâche")
        self.assertEqual(body["climat"]["grape"], "Pinot Noir")
        self.assertEqual(body["truth"]["climat"]["name"]["status"], "reference")
        self.assertEqual(body["truth"]["climat"]["grape"]["status"], "reference")
        self.assertEqual(body["truth"]["price"]["average"]["status"], "unavailable")
        self.assertEqual(body["truth"]["price"]["history"]["status"], "unavailable")
        self.assertEqual(body["truth"]["price"]["merchantCoverage"]["status"], "unavailable")
        self.assertEqual(body["truth"]["comparables"]["status"], "unavailable")
        self.assertEqual(body["price"]["sources"], [])
        self.assertIsNone(body["price"]["history"])
        self.assertIsNone(body["price"]["merchant_count"])
        log_search.assert_called_once()

    @patch("routers.search.supabase_client.log_search")
    @patch("routers.search.supabase_client.get_vintage_rating")
    @patch("routers.search.openai_search.get_wine_price")
    @patch("routers.search.supabase_client.get_cached_price")
    @patch("routers.search.supabase_client.get_grand_cru")
    def test_search_does_not_fabricate_market_sections(
        self,
        get_grand_cru,
        get_cached_price,
        get_wine_price,
        get_vintage_rating,
        log_search,
    ):
        get_grand_cru.return_value = None
        get_cached_price.return_value = None
        get_wine_price.return_value = openai_search._empty_price("openai_missing_key")
        get_vintage_rating.return_value = None

        client = TestClient(main.app)
        response = client.get("/api/search", params={"wine_name": "Montrachet"})
        truth = response.json()["truth"]

        self.assertEqual(response.status_code, 200)
        self.assertEqual(truth["price"]["history"]["value"], None)
        self.assertEqual(truth["price"]["merchantCoverage"]["value"], None)
        self.assertEqual(truth["comparables"]["value"], None)
        self.assertEqual(truth["price"]["history"]["status"], "unavailable")
        self.assertEqual(truth["price"]["merchantCoverage"]["status"], "unavailable")
        self.assertEqual(truth["comparables"]["status"], "unavailable")

    @patch("routers.search.openai_search.get_wine_price")
    @patch("routers.search.supabase_client.get_cached_price")
    @patch("routers.search.supabase_client.get_grand_cru")
    def test_unknown_wine_returns_404_before_market_lookup(self, get_grand_cru, get_cached_price, get_wine_price):
        get_grand_cru.return_value = None
        get_cached_price.return_value = None

        client = TestClient(main.app)
        response = client.get("/api/search", params={"wine_name": "Not A Grand Cru"})

        self.assertEqual(response.status_code, 404)
        get_wine_price.assert_not_called()

    @patch("routers.wines.supabase_client.get_all_grand_crus")
    def test_wines_endpoint_uses_local_reference_data_without_supabase(self, get_all_grand_crus):
        get_all_grand_crus.return_value = []

        client = TestClient(main.app)
        response = client.get("/api/wines")
        body = response.json()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(body["count"], 33)
        self.assertTrue(any(wine["name"] == "La Tâche" for wine in body["wines"]))


if __name__ == "__main__":
    unittest.main()
