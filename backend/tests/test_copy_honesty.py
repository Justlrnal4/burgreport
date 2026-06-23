"""
Copy-honesty lint — a blocking gate over user-facing strings.

BurgReport never sells confident depth it does not have. These phrases imply an
authoritative market, a licensed feed, or movement we cannot honestly assert.
If one appears in UI/API copy, the build fails. Cheapest protection against the
moat eroding one well-meaning word at a time.
"""

import re
import unittest
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]

SCAN_DIRS = [
    REPO / "frontend" / "app",
    REPO / "frontend" / "components",
    REPO / "frontend" / "lib",
    REPO / "backend" / "routers",
    REPO / "backend" / "services",
]
SCAN_SUFFIXES = {".ts", ".tsx", ".py"}

# Case-insensitive banned phrases (overclaims). Keep this list growing.
BANNED = [
    r"powered by wine-?searcher",
    r"live market data",
    r"real-?time price",
    r"updates daily",
    r"trading volume",
    r"demand index",
    r"street price",
    r"\bthe street\b",
    r"price dropped",
    r"market history",
]
_PATTERNS = [re.compile(p, re.IGNORECASE) for p in BANNED]


class CopyHonestyLint(unittest.TestCase):
    def test_no_overclaiming_phrases_in_copy(self):
        offenders = []
        for base in SCAN_DIRS:
            if not base.exists():
                continue
            for path in base.rglob("*"):
                if path.suffix not in SCAN_SUFFIXES or "node_modules" in path.parts:
                    continue
                if path.name.startswith("test_"):
                    continue  # this file names the phrases on purpose
                text = path.read_text(encoding="utf-8", errors="ignore")
                for pat in _PATTERNS:
                    for m in pat.finditer(text):
                        line = text.count("\n", 0, m.start()) + 1
                        offenders.append(f"{path.relative_to(REPO)}:{line}  →  {m.group(0)!r}")
        self.assertEqual(offenders, [], "Overclaiming copy found:\n" + "\n".join(offenders))


if __name__ == "__main__":
    unittest.main()
