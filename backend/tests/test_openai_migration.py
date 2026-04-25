import os
import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient

from services import openai_search
import main


class OpenAIMigrationTests(unittest.TestCase):
    def setUp(self):
        self.original_key = os.environ.pop("OPENAI_API_KEY", None)
        openai_search._client = None

    def tearDown(self):
        if self.original_key is not None:
            os.environ["OPENAI_API_KEY"] = self.original_key
        else:
            os.environ.pop("OPENAI_API_KEY", None)
        openai_search._client = None

    def test_missing_openai_key_returns_unavailable_price_shape(self):
        result = openai_search.get_wine_price("La Tache", 2019)

        self.assertIsNone(result["avg_price_usd"])
        self.assertIsNone(result["min_price_usd"])
        self.assertIsNone(result["max_price_usd"])
        self.assertIsNone(result["merchant_count"])
        self.assertEqual(result["sources"], [])
        self.assertEqual(result["confidence"], "unavailable")
        self.assertEqual(result["source"], "openai_missing_key")

    @patch("routers.search.supabase_client.log_search")
    @patch("routers.search.supabase_client.get_vintage_rating")
    @patch("routers.search.airtable.get_climat_data")
    @patch("routers.search.openai_search.get_wine_info")
    @patch("routers.search.openai_search.get_wine_price")
    @patch("routers.search.supabase_client.get_cached_price")
    @patch("routers.search.supabase_client.get_grand_cru")
    def test_search_route_keeps_missing_openai_data_unavailable(
        self,
        get_grand_cru,
        get_cached_price,
        get_wine_price,
        get_wine_info,
        get_climat_data,
        get_vintage_rating,
        log_search,
    ):
        get_grand_cru.return_value = {"id": "la_tache", "name": "La Tache"}
        get_cached_price.return_value = None
        get_wine_price.return_value = openai_search._empty_price("openai_missing_key")
        get_climat_data.return_value = {
            "name": "La Tache",
            "village": "Vosne-Romanee",
            "cote": "Cote de Nuits",
            "color": "Red",
            "is_monopole": True,
        }
        get_wine_info.return_value = {"name": "La Tache"}
        get_vintage_rating.return_value = None

        client = TestClient(main.app)
        response = client.get("/api/search", params={"wine_name": "La Tache", "vintage": 2019})
        body = response.json()

        self.assertEqual(response.status_code, 200)
        self.assertIsNone(body["price"]["avg_usd"])
        self.assertEqual(body["price"]["sources"], [])
        self.assertEqual(body["price"]["confidence"], "unavailable")
        self.assertEqual(body["meta"]["data_source"], "openai_missing_key")
        log_search.assert_called_once()


if __name__ == "__main__":
    unittest.main()
