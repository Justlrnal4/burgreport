"""
Robust price aggregation from raw merchant offers.

A single Grand Cru climat + vintage spans many producers, so a naive mean over a
handful of scraped offers is misleading (a negociant bottle and a Rousseau differ
10x). This computes an honest central estimate (median) and the real observed
band from the offers we actually have, counts independent price offers separately
from distinct merchant domains, and never invents a number.

It also recognizes that an aggregator listing many merchant offers is real market
evidence: the evidence metric is the number of independent price observations
(offer_count), not just how many distinct domains surfaced them.

Pure functions — safe on live and cached data, idempotent, fully unit-tested.
"""

from statistics import median
from typing import Optional
from urllib.parse import urlsplit

from services.price_quality import (
    MIN_PLAUSIBLE_PRICE_USD,
    NON_MERCHANT_DOMAINS,
    clean_source_url,
)


def _domain(url: str) -> Optional[str]:
    try:
        host = urlsplit(url).netloc.lower()
    except ValueError:
        return None
    if not host:
        return None
    return host[4:] if host.startswith("www.") else host


def _trim_artifacts(pairs: list[tuple]) -> list[tuple]:
    """Drop parsing artifacts (a stray non-bottle number) WITHOUT flattening the
    genuine producer spread. Only acts with enough points to judge, and only
    removes far outliers via a wide IQR fence (3x), so a real wide range survives.
    """
    if len(pairs) < 6:
        return pairs
    prices = sorted(p for p, _ in pairs)
    n = len(prices)
    q1 = prices[n // 4]
    q3 = prices[(3 * n) // 4]
    iqr = q3 - q1
    if iqr <= 0:
        return pairs
    lo = q1 - 3.0 * iqr
    hi = q3 + 3.0 * iqr
    kept = [(p, u) for (p, u) in pairs if lo <= p <= hi]
    return kept or pairs


def _empty(source: str) -> dict:
    return {
        "avg_price_usd": None,
        "min_price_usd": None,
        "max_price_usd": None,
        "merchant_count": None,
        "offer_count": 0,
        "sources": [],
        "confidence": "unavailable",
        "notes": "No usable price observations.",
        "source": source,
    }


def aggregate_observations(observations: list[dict], source: str = "aggregated_listings") -> dict:
    """``observations``: ``[{"price": number, "url": str|None}]``.

    Returns the standard price dict the rest of the app consumes, with:
    - ``avg_price_usd``  = robust median of the kept offers (central estimate)
    - ``min/max_price_usd`` = real observed band (None when single-valued)
    - ``offer_count``    = independent price observations backing the estimate
    - ``merchant_count`` = distinct merchant domains
    - ``sources``        = deduped, tracking-stripped merchant URLs
    """
    pairs = [
        (float(o["price"]), o.get("url"))
        for o in (observations or [])
        if isinstance(o.get("price"), (int, float)) and float(o["price"]) >= MIN_PLAUSIBLE_PRICE_USD
    ]
    if not pairs:
        return _empty(source)

    pairs = _trim_artifacts(pairs)
    prices = [p for p, _ in pairs]
    central = round(median(prices), 2)
    low, high = min(prices), max(prices)

    sources: list[str] = []
    domains: set[str] = set()
    for _, url in pairs:
        clean = clean_source_url(url) if url else None
        if not clean:
            continue
        domain = _domain(clean)
        if not domain or domain in NON_MERCHANT_DOMAINS or domain in domains:
            continue
        domains.add(domain)
        sources.append(clean)

    return {
        "avg_price_usd": central,
        "min_price_usd": low if low != high else None,
        "max_price_usd": high if low != high else None,
        "merchant_count": len(domains) or None,
        "offer_count": len(pairs),
        "sources": sources[:8],
        "confidence": "unavailable",
        "notes": "Robust median across public listing offers; verify with the merchant.",
        "source": source,
    }
