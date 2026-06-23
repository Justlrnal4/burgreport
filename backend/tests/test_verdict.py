import unittest

from services import verdict


CLIMAT = {"name": "La Tâche", "size_ha": 6.1, "is_monopole": True, "village": "Vosne-Romanée", "cote": "Côte de Nuits"}
RATING = {"label": "Exceptional", "stars": 5, "note": "Aromatic, structured, profound"}


def _quality(score, confidence="moderate"):
    return {"score": score, "tier": "multiple", "confidence": confidence}


def _priced(avg=2000, low=1500, high=3000, sources=3):
    return {
        "avg_price_usd": avg,
        "min_price_usd": low,
        "max_price_usd": high,
        "sources": [f"https://m{i}.example.com/x" for i in range(sources)],
    }


class VerdictGateTests(unittest.TestCase):
    def test_no_price_is_insufficient(self):
        v = verdict.build_verdict("La Tâche", 2019, CLIMAT, {"avg_price_usd": None, "sources": []}, RATING, _quality(0))
        self.assertEqual(v["stance"], "insufficient")
        self.assertIn("Too thin", v["headline"])
        self.assertTrue(v["gate"])

    def test_single_source_is_insufficient_even_with_a_quote(self):
        # The gate must win over a quote — never a directional call on thin data.
        v = verdict.build_verdict("La Tâche", 2019, CLIMAT, _priced(sources=1), RATING, _quality(1, "low"), quoted_price=9000)
        self.assertEqual(v["stance"], "insufficient")
        self.assertIsNotNone(v["gate"])

    def test_insufficient_still_carries_reference_context(self):
        v = verdict.build_verdict("La Tâche", 2019, CLIMAT, _priced(sources=1), RATING, _quality(1))
        bases = {f["basis"] for f in v["factors"]}
        self.assertEqual(bases, {"reference"})  # never an estimate-basis claim when we won't call it


class VerdictDirectionTests(unittest.TestCase):
    def test_context_when_no_quote(self):
        v = verdict.build_verdict("La Tâche", 2019, CLIMAT, _priced(), RATING, _quality(3))
        self.assertEqual(v["stance"], "context")
        self.assertIsNone(v["gate"])

    def test_quote_well_above(self):
        v = verdict.build_verdict("La Tâche", 2019, CLIMAT, _priced(avg=2000), RATING, _quality(3), quoted_price=3000)
        self.assertEqual(v["stance"], "well_above")

    def test_quote_above(self):
        v = verdict.build_verdict("La Tâche", 2019, CLIMAT, _priced(avg=2000), RATING, _quality(3), quoted_price=2300)
        self.assertEqual(v["stance"], "above")

    def test_quote_in_line(self):
        v = verdict.build_verdict("La Tâche", 2019, CLIMAT, _priced(avg=2000), RATING, _quality(3), quoted_price=2050)
        self.assertEqual(v["stance"], "in_line")

    def test_quote_below(self):
        v = verdict.build_verdict("La Tâche", 2019, CLIMAT, _priced(avg=2000), RATING, _quality(3), quoted_price=1400)
        self.assertEqual(v["stance"], "below")

    def test_confidence_never_authoritative_in_copy(self):
        v = verdict.build_verdict("La Tâche", 2019, CLIMAT, _priced(), RATING, _quality(3), quoted_price=2050)
        self.assertIn("never authoritative", v["summary"])


if __name__ == "__main__":
    unittest.main()
