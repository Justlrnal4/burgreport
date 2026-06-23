"""
"Defend this price" — a sourced, copy-ready summary a sommelier or retailer can
use to justify a wine's price to a guest or buyer.

Strictly grounded: every line is built only from data we actually have —
reference climat facts, the vintage reference signal, and web-sourced price
estimates carried with their quality caveat. It never invents comparables,
critic scores, or market trends; fields we do not produce are simply omitted,
and the price is always labelled an unvalidated estimate. Pure function of its
inputs (the same dicts the search endpoint already assembles).
"""

from typing import Optional

CAVEAT = (
    "Prices are unvalidated estimates parsed from public merchant listings, not "
    "live quotes. Confirm with the merchant before quoting a guest."
)


def _fmt_usd(value) -> Optional[str]:
    if value is None:
        return None
    return f"${int(round(value)):,}"


def build_defense(
    wine_name: str,
    vintage: Optional[int],
    climat: Optional[dict],
    price_data: Optional[dict],
    vintage_rating: Optional[dict],
    quality: Optional[dict],
) -> dict:
    """Return a grounded, copy-ready price defense. Each point carries its basis."""
    climat = climat or {}
    price_data = price_data or {}
    quality = quality or {}

    name = climat.get("name") or wine_name
    points: list[dict] = []

    # 1. Climat identity — reference data, the most solid thing we have.
    qualifiers = []
    if climat.get("size_ha"):
        qualifiers.append(f"{climat['size_ha']} ha")
    if climat.get("is_monopole"):
        qualifiers.append("monopole")
    lead = f"{name} is a {' '.join(qualifiers)} Grand Cru" if qualifiers else f"{name} is a Grand Cru"
    locale = ", ".join([part for part in (climat.get("village"), climat.get("cote")) if part])
    if locale:
        lead += f" in {locale}"
    if climat.get("grape"):
        lead += f" ({climat['grape']})"
    lead += "."
    points.append({"text": lead, "basis": "reference"})

    # 2. Vintage signal — reference, only when we actually have a rating.
    if vintage and vintage_rating and vintage_rating.get("label"):
        stars = vintage_rating.get("stars")
        star_txt = f" ({stars}/5)" if stars else ""
        sentence = f"The {vintage} vintage is rated {vintage_rating['label']}{star_txt} in our vintage reference"
        note = vintage_rating.get("note")
        sentence += f": {note}." if note else "."
        points.append({"text": sentence, "basis": "vintage reference"})

    # 3. Price context — web-sourced, always tagged with its honest quality.
    avg = price_data.get("avg_price_usd")
    low = price_data.get("min_price_usd")
    high = price_data.get("max_price_usd")
    sources = price_data.get("sources") or []
    if avg is not None:
        if low is not None and high is not None and low != high:
            text = f"Web-sourced prices range {_fmt_usd(low)}–{_fmt_usd(high)} (around {_fmt_usd(avg)})"
        else:
            text = f"The web-sourced price is around {_fmt_usd(avg)}"
        if sources:
            text += f" across {len(sources)} merchant listing{'s' if len(sources) != 1 else ''}"
        tags = [tag for tag in (quality.get("label"), f"{quality.get('confidence')} confidence" if quality.get("confidence") else None) if tag]
        if tags:
            text += f" ({', '.join(tags)})"
        text += "."
        points.append({"text": text, "basis": "web-sourced"})
    else:
        points.append({"text": "No web-sourced price was found for this wine and vintage.", "basis": "web-sourced"})

    summary = " ".join(point["text"] for point in points) + " " + CAVEAT

    return {
        "headline": f"Defending {name}" + (f" {vintage}" if vintage else ""),
        "points": points,
        "sources": sources,
        "caveat": CAVEAT,
        "summary": summary,
    }
