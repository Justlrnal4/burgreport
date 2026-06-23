"""
Tavily-backed price discovery for scheduled cache refreshes.

This is intentionally conservative: it only parses explicit USD prices from
search result snippets and returns unavailable fields when snippets do not
directly support a price.
"""

import logging
import os
import re
from urllib.parse import urlparse

import httpx

from services import price_quality, reference_data

logger = logging.getLogger("burgreport.tavily_search")

TAVILY_SEARCH_URL = "https://api.tavily.com/search"
DEFAULT_DOMAINS = [
    "wine-searcher.com",
    "wine.com",
    "klwines.com",
    "wineaccess.com",
    "totalwine.com",
    "vivino.com",
    "benchmarkwine.com",
    "winebid.com",
    "zachys.com",
    "flickingerwines.com",
    "saratogawine.com",
]

PRICE_RE = re.compile(
    r"(?i)(?:USD|US\$|\$)\s*([1-9][0-9,]*(?:\.[0-9]{2})?)|"
    r"([1-9][0-9,]*(?:\.[0-9]{2})?)\s*(?:USD|US dollars)"
)


def _empty_price(source: str, notes: str = "Price data temporarily unavailable") -> dict:
    return {
        "avg_price_usd": None,
        "min_price_usd": None,
        "max_price_usd": None,
        "merchant_count": None,
        "critic_score": None,
        "critic_name": None,
        "drinking_window": None,
        "sources": [],
        "confidence": "unavailable",
        "notes": notes,
        "source": source,
    }


def _env_int(name: str, default: int) -> int:
    raw = os.getenv(name)
    if not raw:
        return default
    try:
        return int(raw)
    except ValueError:
        logger.warning("%s must be an integer; using %s", name, default)
        return default


def _env_float(name: str, default: float) -> float:
    raw = os.getenv(name)
    if not raw:
        return default
    try:
        return float(raw)
    except ValueError:
        logger.warning("%s must be a number; using %s", name, default)
        return default


def _include_domains() -> list[str]:
    raw = os.getenv("TAVILY_INCLUDE_DOMAINS")
    if not raw:
        return DEFAULT_DOMAINS
    return [domain.strip() for domain in raw.split(",") if domain.strip()]


def _domain(url: str) -> str:
    host = urlparse(url).netloc.lower()
    return host[4:] if host.startswith("www.") else host


def _contains_wine_token(text: str, wine_name: str) -> bool:
    normalized_text = reference_data.normalize_name(text)
    tokens = [
        token
        for token in reference_data.normalize_name(wine_name).split("-")
        if len(token) >= 4 and token not in {"grand", "cru", "wine"}
    ]
    return not tokens or any(token in normalized_text for token in tokens)


def _extract_usd_prices(text: str) -> list[float]:
    min_price = _env_float("PRICE_REFRESH_MIN_USD", 75.0)
    max_price = _env_float("PRICE_REFRESH_MAX_USD", 50000.0)
    prices: list[float] = []

    for match in PRICE_RE.finditer(text):
        raw = match.group(1) or match.group(2)
        if not raw:
            continue
        value = float(raw.replace(",", ""))
        if min_price <= value <= max_price:
            prices.append(value)

    return prices


def _prices_from_results(results: list[dict], wine_name: str, vintage: int | None) -> tuple[list[float], list[str], int]:
    observations: list[float] = []
    sources: list[str] = []
    merchant_domains: set[str] = set()

    for result in results:
        url = str(result.get("url") or "")
        title = str(result.get("title") or "")
        content = str(result.get("content") or "")
        text = " ".join([title, content, url])

        if vintage and str(vintage) not in text:
            continue
        if not _contains_wine_token(text, wine_name):
            continue

        prices = _extract_usd_prices(text)
        if not prices:
            continue

        observations.extend(prices)
        if url and url not in sources:
            sources.append(url)
        domain = _domain(url)
        if domain:
            merchant_domains.add(domain)

    return observations, sources, len(merchant_domains)


def _query(wine_name: str, vintage: int | None) -> str:
    vintage_part = f"{vintage} " if vintage else ""
    return f'"{wine_name}" {vintage_part}Grand Cru Burgundy price USD bottle'


def get_wine_price(wine_name: str, vintage: int | None = None) -> dict:
    api_key = os.getenv("TAVILY_API_KEY")
    if not api_key:
        return _empty_price("tavily_missing_key", "TAVILY_API_KEY is not set")

    payload = {
        "query": _query(wine_name, vintage),
        "topic": "general",
        "search_depth": os.getenv("TAVILY_SEARCH_DEPTH", "basic"),
        "max_results": _env_int("TAVILY_MAX_RESULTS", 8),
        "include_answer": False,
        "include_raw_content": False,
        "include_domains": _include_domains(),
    }

    try:
        response = httpx.post(
            TAVILY_SEARCH_URL,
            headers={"Authorization": f"Bearer {api_key}"},
            json=payload,
            timeout=_env_float("TAVILY_TIMEOUT_SECONDS", 30.0),
        )
        if response.status_code == 401:
            return _empty_price("tavily_auth_error", "Tavily authentication failed")
        if response.status_code == 429:
            return _empty_price("tavily_rate_limit", "Tavily rate limit reached")
        response.raise_for_status()
        data = response.json()
    except httpx.TimeoutException as exc:
        logger.error("Tavily timeout for %s %s: %s", wine_name, vintage, exc)
        return _empty_price("tavily_timeout")
    except httpx.HTTPError as exc:
        logger.error("Tavily request error for %s %s: %s", wine_name, vintage, exc)
        return _empty_price("tavily_error")
    except ValueError as exc:
        logger.error("Tavily JSON parse error for %s %s: %s", wine_name, vintage, exc)
        return _empty_price("tavily_parse_error")

    prices, sources, merchant_count = _prices_from_results(data.get("results") or [], wine_name, vintage)
    if not prices:
        return _empty_price(
            "tavily_no_price",
            "No direct USD bottle prices found in trusted search snippets",
        )

    return price_quality.sanitize_price_data({
        "avg_price_usd": round(sum(prices) / len(prices), 2),
        "min_price_usd": min(prices),
        "max_price_usd": max(prices),
        "merchant_count": merchant_count or None,
        "critic_score": None,
        "critic_name": None,
        "drinking_window": None,
        "sources": sources[:8],
        "confidence": "unavailable",
        "notes": "Parsed from search result snippets; verify linked merchant pages.",
        "source": "tavily_search_snippets",
    })
