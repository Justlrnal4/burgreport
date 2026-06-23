"""
The Defensibility Verdict — BurgReport's hero answer.

Gives a straight, plain-language read on whether a Grand Cru price is defensible
and how sure we are — and, when the user supplies the price they were quoted,
where that quote sits against public listings.

Honesty is enforced HERE, not just in the copy: the verdict is HARD-GATED on the
same data-quality tier the rest of the app uses. Thin sourcing (no price, or only
a single observation) returns an honest "too thin to call" — never a directional
verdict on one stale listing. The refusal IS the feature. Every directional read
is labelled an unvalidated estimate and is never presented as authoritative.

Pure function of the dicts the search endpoint already assembles.
"""

from typing import Optional

CAVEAT = (
    "Prices are unvalidated estimates parsed from public merchant listings, not "
    "live quotes or a licensed market feed. Confirm with the merchant."
)

# Minimum data-quality score for a directional verdict. score is 0..3:
# 0 none/unsourced, 1 single, 2 limited (2 sources), 3 multiple (3+).
MIN_SCORE_FOR_DIRECTION = 2

# Quote-vs-listings thresholds (ratio of quote to the average estimate).
WELL_ABOVE = 1.30
ABOVE = 1.10
BELOW = 0.80


def _fmt_usd(value) -> Optional[str]:
    if value is None:
        return None
    return f"${int(round(value)):,}"


def _scarcity_factor(climat: dict) -> Optional[dict]:
    size = climat.get("size_ha")
    monopole = climat.get("is_monopole")
    if size and monopole:
        detail = f"A {size} ha monopole — a single owner and tiny production concentrate scarcity."
    elif size:
        detail = f"A {size} ha Grand Cru — limited Grand Cru hectares cap supply."
    elif monopole:
        detail = "A monopole — single-owner, so supply is structurally scarce."
    else:
        return None
    return {"label": "Scarcity", "detail": detail, "basis": "reference"}


def _vintage_factor(vintage: Optional[int], vintage_rating: Optional[dict]) -> Optional[dict]:
    if not (vintage and vintage_rating and vintage_rating.get("label")):
        return None
    stars = vintage_rating.get("stars")
    star_txt = f" ({stars}/5)" if stars else ""
    note = vintage_rating.get("note")
    detail = f"The {vintage} vintage is rated {vintage_rating['label']}{star_txt} in our vintage reference"
    detail += f": {note}." if note else "."
    return {"label": "Vintage", "detail": detail, "basis": "reference"}


def _context_factors(vintage, climat, vintage_rating) -> list:
    return [f for f in (_scarcity_factor(climat or {}), _vintage_factor(vintage, vintage_rating)) if f]


def build_verdict(
    wine_name: str,
    vintage: Optional[int],
    climat: Optional[dict],
    price_data: Optional[dict],
    vintage_rating: Optional[dict],
    quality: Optional[dict],
    quoted_price: Optional[float] = None,
) -> dict:
    """Return a confidence-gated defensibility verdict. Pure function of inputs."""
    climat = climat or {}
    price_data = price_data or {}
    quality = quality or {}

    name = climat.get("name") or wine_name
    label_suffix = f" {vintage}" if vintage else ""
    avg = price_data.get("avg_price_usd")
    low = price_data.get("min_price_usd")
    high = price_data.get("max_price_usd")
    source_count = len(price_data.get("sources") or [])
    score = quality.get("score", 0)
    confidence = quality.get("confidence", "unavailable")
    band = {"avg": avg, "low": low, "high": high}

    # ── GATE: thin sourcing → honest refusal, never a directional guess ───────
    if avg is None or score < MIN_SCORE_FOR_DIRECTION:
        if avg is None:
            gate = "No usable price was returned, so there is nothing to place against public listings."
            summary = (
                f"We don't have a usable public-listing price for {name}{label_suffix} right now, "
                "so we won't put a number on it."
            )
        else:
            need = "one more independent listing" if source_count == 1 else "at least two independent listings"
            gate = (
                f"Only {source_count} independent listing{'s' if source_count != 1 else ''} found — "
                f"need {need} for a directional read."
            )
            summary = (
                f"We found {source_count} public listing{'s' if source_count != 1 else ''} for {name}{label_suffix}. "
                "That's too thin to say whether a price is fair — and we won't guess. "
                "Here's what would change this: one more independent source would let us place it."
            )
        return {
            "stance": "insufficient",
            "headline": f"Too thin to call{(' for ' + name + label_suffix) if name else ''}",
            "summary": summary,
            "quotedPrice": quoted_price,
            "band": band,
            "sourceCount": source_count,
            "confidence": confidence,
            "factors": _context_factors(vintage, climat, vintage_rating),
            "gate": gate,
            "caveat": CAVEAT,
        }

    # ── We have ≥2 independent listings: a directional read is honest ─────────
    band_txt = (
        f"{_fmt_usd(low)}–{_fmt_usd(high)} (around {_fmt_usd(avg)})"
        if low is not None and high is not None and low != high
        else f"around {_fmt_usd(avg)}"
    )
    listings_txt = f"{source_count} public listing{'s' if source_count != 1 else ''}"
    factors = _context_factors(vintage, climat, vintage_rating)

    if quoted_price is not None and avg:
        ratio = quoted_price / avg
        if ratio >= WELL_ABOVE:
            stance, phrase = "well_above", "well above the public listings"
        elif ratio >= ABOVE:
            stance, phrase = "above", "above the public listings"
        elif ratio <= BELOW:
            stance, phrase = "below", "below the public listings — confirm it's the same wine, vintage, and bottle format"
        else:
            stance, phrase = "in_line", "roughly in line with the public listings"
        pct = abs(round((ratio - 1) * 100))
        delta_txt = f" (~{pct}% {'above' if ratio >= 1 else 'below'} the average estimate)" if pct >= 1 else ""
        headline = f"{_fmt_usd(quoted_price)} is {phrase}{delta_txt}."
        summary = (
            f"Public listings for {name}{label_suffix} sit {band_txt} across {listings_txt}. "
            f"Your {_fmt_usd(quoted_price)} quote is {phrase}. "
            f"Confidence: {confidence} (unvalidated estimate, never authoritative)."
        )
    else:
        stance = "context"
        headline = f"Public listings for {name}{label_suffix} sit {band_txt}."
        summary = (
            f"Across {listings_txt}, the estimate lands {band_txt}. "
            "Enter the price you were quoted to see exactly where it stands. "
            f"Confidence: {confidence} (unvalidated estimate, never authoritative)."
        )

    return {
        "stance": stance,
        "headline": headline,
        "summary": summary,
        "quotedPrice": quoted_price,
        "band": band,
        "sourceCount": source_count,
        "confidence": confidence,
        "factors": factors,
        "gate": None,
        "caveat": CAVEAT,
    }
