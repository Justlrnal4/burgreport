"""
Honest per-result data-quality assessment.

Turns the (already-sanitized) price fields into a transparent quality signal the
UI can render as a badge — WITHOUT inventing precision. Principles:

- The score is an ordinal *tier* (0–3), never a percentage. We do not have a
  validated scoring model, so we never imply one.
- Confidence is capped at "moderate". Every price here is an unvalidated estimate
  parsed from public listings, so we never claim "high" / authoritative.
- Every tier carries the factors behind it (source count, spread, freshness,
  single-point) so the UI can explain *why* instead of asserting a number.

Runs on the same price dict shape both providers emit (see price_quality), after
sanitization. Pure function of its input — safe to call on live and cached rows.
"""

from datetime import datetime, timezone
from typing import Optional

WIDE_SPREAD_PCT = 60.0
STALE_AFTER_HOURS = 168.0  # 7 days


def _age_hours(fetched_at) -> Optional[float]:
    if not isinstance(fetched_at, str) or not fetched_at:
        return None
    try:
        ts = datetime.fromisoformat(fetched_at.replace("Z", "+00:00"))
    except ValueError:
        return None
    if ts.tzinfo is None:
        ts = ts.replace(tzinfo=timezone.utc)
    return round((datetime.now(timezone.utc) - ts).total_seconds() / 3600.0, 1)


def assess_quality(price_data: dict) -> dict:
    """Return an honest, factor-backed quality assessment for a price result."""
    avg = price_data.get("avg_price_usd")
    low = price_data.get("min_price_usd")
    high = price_data.get("max_price_usd")
    source_count = len(price_data.get("sources") or [])
    age_hours = _age_hours(price_data.get("fetched_at"))
    is_stale = age_hours is not None and age_hours > STALE_AFTER_HOURS

    # No usable price → nothing to score.
    if avg is None:
        return {
            "tier": "none",
            "score": 0,
            "label": "No price data",
            "confidence": "unavailable",
            "factors": {
                "sourceCount": source_count,
                "spreadPct": None,
                "isSinglePoint": False,
                "ageHours": age_hours,
                "isStale": is_stale,
            },
            "note": "No price was returned for this wine and vintage.",
        }

    is_single_point = low is None or high is None or low == high
    spread_pct = None
    if low is not None and high is not None and avg:
        spread_pct = round((high - low) / avg * 100.0, 1)

    # Base tier from how many independent merchant sources back the price.
    if source_count == 0:
        tier, score, label = "unsourced", 0, "Unsourced estimate"
    elif source_count == 1:
        tier, score, label = "single", 1, "Single source"
    elif source_count == 2:
        tier, score, label = "limited", 2, "Limited data"
    else:
        tier, score, label = "multiple", 3, "Multiple sources"

    # Web-parsed prices never read as authoritative; "moderate" is the ceiling,
    # and any weakening factor pulls confidence back down to "low".
    confidence = "moderate" if score >= 3 else "low"
    if is_single_point or is_stale or (spread_pct is not None and spread_pct > WIDE_SPREAD_PCT):
        confidence = "low"

    if source_count == 0:
        note = "No merchant listing was captured for this price."
    else:
        plural = "s" if source_count != 1 else ""
        note = f"Based on {source_count} merchant source{plural}."
    if is_single_point and source_count:
        note += " Single observed price, not a range."
    if spread_pct is not None and spread_pct > WIDE_SPREAD_PCT:
        note += f" Unusually wide spread ({spread_pct:.0f}%) — check vintage and bottle format."
    if is_stale and age_hours is not None:
        note += f" Cached ~{int(age_hours // 24)}d ago; may be out of date."
    note += " Unvalidated estimate — verify with the merchant."

    return {
        "tier": tier,
        "score": score,
        "label": label,
        "confidence": confidence,
        "factors": {
            "sourceCount": source_count,
            "spreadPct": spread_pct,
            "isSinglePoint": is_single_point,
            "ageHours": age_hours,
            "isStale": is_stale,
        },
        "note": note,
    }
