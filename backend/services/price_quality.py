"""
Price data quality / honesty enforcement.

Web search (and, more rarely, snippet parsing) can return prices that are not
backed by real merchant evidence: a fabricated ``merchant_count``, a single
self-referential source (our own site cited back at us), a zero-spread "range",
or an implausible placeholder price. The truth model marks web-sourced prices as
``live``, so anything that survives to that layer is presented as real market
data. This module is the single chokepoint that removes or downgrades values we
cannot honestly stand behind — before they reach the API response or the cache.

Provider outputs share one dict shape (see ``openai_search`` / ``tavily_search``),
so this runs on both. It only ever *removes* dishonest data; it never invents a
number. It is idempotent: a second pass is a no-op.
"""

import re
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

# No real Grand Cru Burgundy bottle trades below this. Anything lower is a
# parsing artifact (per-glass pour, a placeholder like $1, a stray number) — not
# a bottle price.
MIN_PLAUSIBLE_PRICE_USD = 20.0

# Domains that are not independent merchant evidence. Our own domain appearing as
# a "source" means the web search cited us citing ourselves.
NON_MERCHANT_DOMAINS = {
    "burgreport.com",
}

_MARKDOWN_URL_RE = re.compile(r"\((https?://[^)\s]+)\)")
_BARE_URL_RE = re.compile(r"https?://[^\s\])]+")


def _domain(netloc: str) -> str:
    host = netloc.lower()
    return host[4:] if host.startswith("www.") else host


def clean_source_url(raw) -> str | None:
    """Unwrap a possibly-markdown source into a bare, tracking-free URL.

    Handles the ``([domain](https://url?utm_source=openai))`` form the web_search
    tool emits, strips ``utm_*`` tracking params, and returns ``None`` when no
    usable URL is present.
    """
    if not isinstance(raw, str) or not raw.strip():
        return None
    match = _MARKDOWN_URL_RE.search(raw)
    url = match.group(1) if match else None
    if url is None:
        match = _BARE_URL_RE.search(raw)
        url = match.group(0) if match else None
    if url is None:
        return None
    try:
        parts = urlsplit(url)
    except ValueError:
        return None
    if not parts.netloc:
        return None
    query = [(k, v) for k, v in parse_qsl(parts.query) if not k.lower().startswith("utm_")]
    return urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(query), ""))


def _clean_sources(raw_sources) -> tuple[list[str], int]:
    """Return (clean URLs, distinct merchant-domain count).

    Drops unparseable entries and our own domain, and dedupes by merchant domain
    so two listings from the same shop count once.
    """
    cleaned: list[str] = []
    seen_domains: set[str] = set()
    for item in raw_sources or []:
        url = clean_source_url(item)
        if not url:
            continue
        domain = _domain(urlsplit(url).netloc)
        if not domain or domain in NON_MERCHANT_DOMAINS or domain in seen_domains:
            continue
        seen_domains.add(domain)
        cleaned.append(url)
    return cleaned, len(seen_domains)


def sanitize_price_data(data: dict) -> dict:
    """Strip/​downgrade price fields we cannot honestly present. Mutates and returns ``data``."""
    if not isinstance(data, dict):
        return data

    # 1. Sources: unwrap markdown, drop tracking params, drop our own domain,
    #    dedupe by merchant domain.
    sources, distinct_merchants = _clean_sources(data.get("sources"))
    data["sources"] = sources

    # 2. Implausibly low prices are parsing artifacts, not market data.
    for key in ("avg_price_usd", "min_price_usd", "max_price_usd"):
        value = data.get(key)
        if value is not None and value < MIN_PLAUSIBLE_PRICE_USD:
            data[key] = None

    # A band with no average is not presentable — drop orphan bounds so the UI
    # never shows a lone "low $425" with no headline price.
    if data.get("avg_price_usd") is None:
        data["min_price_usd"] = None
        data["max_price_usd"] = None

    # 3. merchant_count must be backed by real, distinct merchant sources. The
    #    web_search prompt forbids inferring it; if a count came back that we
    #    cannot corroborate with that many sources, drop it rather than show a
    #    fabricated figure. We never invent a count from the source list either
    #    (merchant coverage needs real backend methodology — see truth model).
    merchant_count = data.get("merchant_count")
    if merchant_count is not None and (distinct_merchants == 0 or merchant_count > distinct_merchants):
        data["merchant_count"] = None

    # 4. A "range" where both bounds equal the average is a single observation,
    #    not a spread. Keep the point estimate as the average; never present a
    #    fake band.
    avg = data.get("avg_price_usd")
    if avg is not None and data.get("min_price_usd") == avg and data.get("max_price_usd") == avg:
        data["min_price_usd"] = None
        data["max_price_usd"] = None

    return data
