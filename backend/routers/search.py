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

from services import openai_search, supabase_client, airtable

logger = logging.getLogger("burgreport.search")

router = APIRouter(prefix="/api", tags=["search"])


@router.get("/search")
async def search_wine(
    wine_name: str = Query(..., description="Grand Cru name, e.g. 'La Tâche' or 'Chambertin'"),
    vintage: Optional[int] = Query(None, description="4-digit vintage year, e.g. 2019"),
):
    start = time.time()
    logger.info(f"Search: '{wine_name}' vintage={vintage}")

    # ── 1. Look up the grand cru ─────────────────────────────────────────────
    grand_cru = supabase_client.get_grand_cru(wine_name)
    grand_cru_id = grand_cru["id"] if grand_cru else wine_name.lower().replace(" ", "_")

    # ── 2. Check Supabase price cache ────────────────────────────────────────
    cache_hit = False
    price_data = supabase_client.get_cached_price(grand_cru_id, vintage)
    if price_data:
        cache_hit = True
    else:
        # ── 3. Fetch candidate price context via OpenAI web search ────────
        price_data = openai_search.get_wine_price(wine_name, vintage)

        # ── 4. Cache the result ───────────────────────────────────────────
        if price_data.get("avg_price_usd"):
            supabase_client.set_cached_price(grand_cru_id, vintage, price_data)

    # ── 5. Get climat data from Airtable ────────────────────────────────────
    climat = airtable.get_climat_data(wine_name)
    if not climat:
        # Fall back to OpenAI for climat info
        logger.info(f"No Airtable data for {wine_name}, using OpenAI fallback")
        climat = openai_search.get_wine_info(wine_name)

    # ── 6. Get vintage rating ────────────────────────────────────────────────
    cote = (climat or {}).get("cote", "Côte de Nuits")
    zone = "cote_de_beaune" if "Beaune" in cote else "cote_de_nuits"
    vintage_rating = supabase_client.get_vintage_rating(vintage, zone)

    # ── 7. Log the search ────────────────────────────────────────────────────
    elapsed_ms = int((time.time() - start) * 1000)
    supabase_client.log_search(wine_name, grand_cru_id, vintage, elapsed_ms)

    # ── 8. Build response ────────────────────────────────────────────────────
    return {
        "climat": {
            "name": (climat or {}).get("name", wine_name),
            "aoc": (climat or {}).get("aoc"),
            "village": (climat or {}).get("village"),
            "cote": (climat or {}).get("cote"),
            "size_ha": (climat or {}).get("size_ha"),
            "is_monopole": (climat or {}).get("is_monopole", False),
            "description": (climat or {}).get("description"),
            "key_producers": (climat or {}).get("key_producers", []),
            "food_pairings": (climat or {}).get("food_pairings", []),
            "color": (climat or {}).get("color", "Red"),
        },
        "price": {
            "avg_usd": price_data.get("avg_price_usd"),
            "min_usd": price_data.get("min_price_usd"),
            "max_usd": price_data.get("max_price_usd"),
            "merchant_count": price_data.get("merchant_count"),
            "critic_score": price_data.get("critic_score"),
            "critic_name": price_data.get("critic_name"),
            "drinking_window": price_data.get("drinking_window"),
            "sources": price_data.get("sources", []),
            "confidence": price_data.get("confidence", "unavailable"),
            "notes": price_data.get("notes"),
        },
        "vintage": vintage_rating,
        "meta": {
            "query": wine_name,
            "vintage": vintage,
            "response_ms": elapsed_ms,
            "cache_hit": cache_hit,
            "data_source": price_data.get("source", "unknown"),
        },
    }
