"""
Search Router
GET /api/search?wine_name=La+Tâche&vintage=2019

The core endpoint. Orchestrates:
1. Cache check (Supabase)
2. OpenAI web search (candidate pricing)
3. Airtable climat data
4. Vintage rating lookup
5. Merge + return
"""

import time
import logging
from typing import Optional
from fastapi import APIRouter, HTTPException, Query

from models.common import estimated_field, reference_field, unavailable_field
from services import openai_search, tavily_search, price_aggregate, supabase_client, airtable, data_quality, price_defense, price_quality, reference_data, verdict as verdict_service

logger = logging.getLogger("burgreport.search")

router = APIRouter(prefix="/api", tags=["search"])


@router.get("/search")
async def search_wine(
    wine_name: str = Query(..., description="Grand Cru name, e.g. 'La Tâche' or 'Chambertin'"),
    vintage: Optional[int] = Query(None, description="4-digit vintage year, e.g. 2019"),
    quoted_price: Optional[float] = Query(None, gt=0, description="Optional USD price you were quoted, to compare against public listings"),
):
    start = time.time()
    logger.info(f"Search: '{wine_name}' vintage={vintage}")

    # ── 1. Look up the Grand Cru reference record ───────────────────────────
    reference = reference_data.find_climat(wine_name)
    grand_cru = supabase_client.get_grand_cru(wine_name)
    climat = reference or grand_cru or airtable.get_climat_data(wine_name)

    if not climat:
        raise HTTPException(status_code=404, detail=f"Wine '{wine_name}' not found")

    grand_cru_id = supabase_client.canonical_grand_cru_id(wine_name, grand_cru or climat)

    # ── 2. Check Supabase price cache ────────────────────────────────────────
    cache_hit = False
    price_data = supabase_client.get_cached_price(grand_cru_id, vintage)
    if price_data:
        cache_hit = True
        # Scrub legacy junk rows cached before the quality layer existed
        # (fabricated merchant counts, self-referential sources, fake ranges).
        price_data = price_quality.sanitize_price_data(price_data)
    else:
        # ── 3. Fetch live prices. Primary: aggregate real merchant offers from
        #        Tavily (recognizes an aggregator's many listings as evidence).
        #        Fallback: OpenAI web search when no offers are parsed. ───────
        offers = tavily_search.get_wine_offers(wine_name, vintage)
        if offers:
            price_data = price_aggregate.aggregate_observations(offers, source="tavily_aggregated")
        else:
            price_data = openai_search.get_wine_price(wine_name, vintage)

        # ── 4. Cache a real result ────────────────────────────────────────
        if price_data.get("avg_price_usd"):
            supabase_client.set_cached_price(grand_cru_id, vintage, price_data)

    # ── 5. Get vintage rating ────────────────────────────────────────────────
    cote = (climat or {}).get("cote", "Côte de Nuits")
    zone = "cote_de_beaune" if "Beaune" in cote else "cote_de_nuits"
    vintage_rating = supabase_client.get_vintage_rating(vintage, zone)

    # ── 6. Log the search ────────────────────────────────────────────────────
    elapsed_ms = int((time.time() - start) * 1000)
    supabase_client.log_search(wine_name, grand_cru_id, vintage, elapsed_ms)

    truth = build_truth_response(
        query=wine_name,
        vintage=vintage,
        climat=climat,
        price_data=price_data,
        vintage_rating=vintage_rating,
        response_ms=elapsed_ms,
        cache_hit=cache_hit,
    )

    # Honest, factor-backed quality signal for the price (badge fuel for the UI).
    quality = data_quality.assess_quality(price_data)
    truth["quality"] = quality

    # Sourced, copy-ready "defend this price" summary for sommeliers/retailers.
    defense = price_defense.build_defense(
        wine_name=wine_name,
        vintage=vintage,
        climat=climat,
        price_data=price_data,
        vintage_rating=vintage_rating,
        quality=quality,
    )

    # The Defensibility Verdict: a straight, confidence-gated answer. Thin
    # sourcing yields an honest "too thin to call", never a directional guess.
    verdict = verdict_service.build_verdict(
        wine_name=wine_name,
        vintage=vintage,
        climat=climat,
        price_data=price_data,
        vintage_rating=vintage_rating,
        quality=quality,
        quoted_price=quoted_price,
    )

    # ── 7. Build legacy-compatible response with additive truth block ────────
    return {
        "climat": {
            "name": (climat or {}).get("name", wine_name),
            "slug": (climat or {}).get("slug"),
            "aoc": (climat or {}).get("aoc"),
            "village": (climat or {}).get("village"),
            "cote": (climat or {}).get("cote"),
            "size_ha": (climat or {}).get("size_ha"),
            "is_monopole": (climat or {}).get("is_monopole", False),
            "description": (climat or {}).get("description"),
            "key_producers": (climat or {}).get("key_producers", []),
            "food_pairings": (climat or {}).get("food_pairings", []),
            "color": (climat or {}).get("color", "Red"),
            "grape": (climat or {}).get("grape"),
        },
        "price": {
            "avg_usd": price_data.get("avg_price_usd"),
            "min_usd": price_data.get("min_price_usd"),
            "max_usd": price_data.get("max_price_usd"),
            "merchant_count": price_data.get("merchant_count"),
            "offer_count": price_data.get("offer_count"),
            "critic_score": None,
            "critic_name": None,
            "drinking_window": price_data.get("drinking_window"),
            "sources": price_data.get("sources", []),
            "history": None,
            "confidence": price_data.get("confidence", "unavailable"),
            "notes": price_data.get("notes"),
            "fetched_at": price_data.get("fetched_at"),
            "data_quality": quality,
        },
        "vintage": vintage_rating,
        "meta": {
            "query": wine_name,
            "vintage": vintage,
            "response_ms": elapsed_ms,
            "cache_hit": cache_hit,
            "data_source": _price_source(price_data),
        },
        "defense": defense,
        "verdict": verdict,
        "truth": truth,
    }


def _data_field(field):
    return field.model_dump()


def _estimated_market_field(value, source: str | None, note: str = "Not enough merchant observations returned."):
    """A web-sourced price is an ESTIMATE, never a 'live' authoritative figure.
    The 'live' status is reserved for a future licensed/first-party feed."""
    estimate_note = "Unvalidated estimate parsed from public merchant listings — verify with the merchant."
    unavailable_sources = {
        "openai_missing_key",
        "openai_auth_error",
        "openai_bad_request",
        "openai_rate_limit",
        "openai_timeout",
        "openai_connection_error",
        "openai_parse_error",
        "openai_error",
        "error",
        "unknown",
    }
    if source and source.startswith("openai_status_"):
        return _data_field(unavailable_field(note=note))
    if value is None or source in unavailable_sources:
        return _data_field(unavailable_field(note=note))
    return _data_field(estimated_field(value, source=source, note=estimate_note))


def _price_source(price_data: dict) -> str:
    return price_data.get("source") or price_data.get("data_source") or "unknown"


def build_truth_response(
    query: str,
    vintage: Optional[int],
    climat: dict,
    price_data: dict,
    vintage_rating: Optional[dict],
    response_ms: int,
    cache_hit: bool,
) -> dict:
    price_source = _price_source(price_data)
    no_market_note = "Not enough merchant observations returned."
    no_coverage_note = "Merchant coverage requires normalized backend observations."

    return {
        "query": {
            "wineName": query,
            "vintage": vintage,
        },
        "climat": {
            "name": _data_field(reference_field(climat.get("name"))),
            "slug": _data_field(reference_field(climat.get("slug"))),
            "village": _data_field(reference_field(climat.get("village"))),
            "cote": _data_field(reference_field(climat.get("cote"))),
            "color": _data_field(reference_field(climat.get("color"))),
            "grape": _data_field(reference_field(climat.get("grape"))),
            "sizeHa": _data_field(reference_field(climat.get("size_ha"))),
            "isMonopole": _data_field(reference_field(climat.get("is_monopole"))),
        },
        "price": {
            "average": _estimated_market_field(price_data.get("avg_price_usd"), price_source, no_market_note),
            "low": _estimated_market_field(price_data.get("min_price_usd"), price_source, no_market_note),
            "high": _estimated_market_field(price_data.get("max_price_usd"), price_source, no_market_note),
            "currency": _data_field(reference_field("USD", note="Currency for normalized market fields.")),
            "history": _data_field(unavailable_field(note="Price history requires stored time-series observations.")),
            "merchantCoverage": _data_field(unavailable_field(note=no_coverage_note)),
        },
        "vintage": {
            "year": _data_field(reference_field(vintage) if vintage else unavailable_field(note="No vintage was provided.")),
            "signal": _data_field(
                reference_field(vintage_rating.get("label"), source="BurgReport vintage reference")
                if vintage_rating and vintage_rating.get("label")
                else unavailable_field(note="Vintage signal is unavailable for this query.")
            ),
        },
        "comparables": _data_field(unavailable_field(note="Comparables require backend methodology before display.")),
        "meta": {
            "responseMs": response_ms,
            "cacheHit": cache_hit,
            "backend": "burgreport-fastapi",
        },
    }
