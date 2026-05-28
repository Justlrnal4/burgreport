import json
import os
import tempfile
import unittest

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


if __name__ == "__main__":
    unittest.main()
