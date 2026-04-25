"""
Supabase Service
Handles database operations: price cache, grand cru lookup, vintage ratings, search logging.
"""

import os
import logging
from typing import Optional
from datetime import datetime, timezone, timedelta
from supabase import create_client, Client

logger = logging.getLogger("burgreport.supabase")

CACHE_TTL_HOURS = 24

_client: Optional[Client] = None


def get_client() -> Optional[Client]:
    global _client
    if _client is None:
        url = os.getenv("SUPABASE_URL")
        # Try keys in order: service JWT, anon JWT. Skip sb_secret_ (unsupported by SDK 2.x)
        key = os.getenv("SUPABASE_SERVICE_KEY")
        if not key or key.startswith("sb_secret_") or key.startswith("sb_publishable_"):
            key = os.getenv("SUPABASE_ANON_KEY") or os.getenv("SUPABASE_KEY")
        if url and key:
            try:
                _client = create_client(url, key)
                logger.info("Supabase client initialized")
            except Exception as e:
                logger.error(f"Supabase client init failed: {e}")
        else:
            logger.warning(f"Supabase env vars not set — running without DB cache (url={'set' if url else 'missing'}, key={'set' if key else 'missing'})")
    return _client


# ─── Grand Crus ───────────────────────────────────────────────────────────────

def get_grand_cru(name: str) -> Optional[dict]:
    """Fuzzy search for a grand cru by name."""
    db = get_client()
    if not db:
        return None
    try:
        result = db.table("grand_crus").select("*").ilike("name", f"%{name}%").limit(1).execute()
        return result.data[0] if result.data else None
    except Exception as e:
        logger.error(f"get_grand_cru error: {e}")
        return None


def get_all_grand_crus() -> list:
    """Return all 33 grand crus for autocomplete."""
    db = get_client()
    if not db:
        return []
    try:
        result = db.table("grand_crus").select("id, slug, name, aoc, village, cote, color, grape, size_ha, is_monopole").order("name").execute()
        return result.data or []
    except Exception as e:
        logger.error(f"get_all_grand_crus error: {e}")
        return []


# ─── Price Cache ──────────────────────────────────────────────────────────────

def get_cached_price(grand_cru_id: str, vintage: Optional[int]) -> Optional[dict]:
    """Return cached price if it exists and is less than 24 hours old."""
    db = get_client()
    if not db:
        return None
    try:
        cutoff = (datetime.now(timezone.utc) - timedelta(hours=CACHE_TTL_HOURS)).isoformat()
        query = (
            db.table("wine_prices")
            .select("*")
            .eq("grand_cru_id", grand_cru_id)
            .gt("fetched_at", cutoff)
        )
        if vintage:
            query = query.eq("vintage", vintage)
        else:
            query = query.is_("vintage", "null")
        result = query.limit(1).execute()
        if result.data:
            logger.info(f"Cache HIT: {grand_cru_id} {vintage}")
            return result.data[0]
        logger.info(f"Cache MISS: {grand_cru_id} {vintage}")
        return None
    except Exception as e:
        logger.error(f"get_cached_price error: {e}")
        return None


def set_cached_price(grand_cru_id: str, vintage: Optional[int], price_data: dict) -> bool:
    """Upsert price data into the cache table."""
    db = get_client()
    if not db:
        return False
    try:
        row = {
            "grand_cru_id": grand_cru_id,
            "vintage": vintage,
            "avg_price_usd": price_data.get("avg_price_usd"),
            "min_price_usd": price_data.get("min_price_usd"),
            "max_price_usd": price_data.get("max_price_usd"),
            "merchant_count": price_data.get("merchant_count"),
            "critic_score": price_data.get("critic_score"),
            "critic_name": price_data.get("critic_name"),
            "drinking_window": price_data.get("drinking_window"),
            "sources": price_data.get("sources", []),
            "confidence": price_data.get("confidence", "unavailable"),
            "data_source": price_data.get("source", "unknown"),
            "fetched_at": datetime.now(timezone.utc).isoformat(),
        }
        db.table("wine_prices").upsert(row, on_conflict="grand_cru_id,vintage").execute()
        logger.info(f"Cached price for {grand_cru_id} {vintage}")
        return True
    except Exception as e:
        logger.error(f"set_cached_price error: {e}")
        return False


# ─── Vintage Ratings ──────────────────────────────────────────────────────────

VINTAGE_FALLBACK = {
    2023: {"stars": 4, "label": "Excellent", "note": "Elegant, aromatic vintage"},
    2022: {"stars": 5, "label": "Exceptional", "note": "Powerful and concentrated"},
    2021: {"stars": 3, "label": "Good", "note": "Delicate, fresh, classic style"},
    2020: {"stars": 5, "label": "Exceptional", "note": "Rich, opulent, age-worthy"},
    2019: {"stars": 5, "label": "Exceptional", "note": "Aromatic, structured, profound"},
    2018: {"stars": 4, "label": "Excellent", "note": "Ripe, generous, approachable"},
    2017: {"stars": 3, "label": "Good", "note": "Charming, early-drinking style"},
    2016: {"stars": 4, "label": "Excellent", "note": "Classic, mineral, age-worthy"},
    2015: {"stars": 5, "label": "Exceptional", "note": "Rich, velvety, hedonistic"},
    2014: {"stars": 4, "label": "Excellent", "note": "Bright acidity, classic Burgundy"},
    2013: {"stars": 3, "label": "Good", "note": "Firm, structured, needs time"},
    2012: {"stars": 4, "label": "Excellent", "note": "Powerful and concentrated"},
    2011: {"stars": 3, "label": "Good", "note": "Uneven, some fine bottles"},
    2010: {"stars": 5, "label": "Exceptional", "note": "Magnificent, one of the decade"},
    2009: {"stars": 5, "label": "Exceptional", "note": "Opulent, generous, hedonistic"},
    2008: {"stars": 3, "label": "Good", "note": "Difficult year, some surprises"},
    2007: {"stars": 3, "label": "Good", "note": "Light, elegant, early drinking"},
    2006: {"stars": 3, "label": "Good", "note": "Variable, best are very good"},
    2005: {"stars": 5, "label": "Legendary", "note": "One of the greatest ever"},
}


def get_vintage_rating(year: Optional[int], zone: str = "cote_de_nuits") -> Optional[dict]:
    """Look up vintage rating from Supabase, fall back to hardcoded data."""
    if not year:
        return None
    db = get_client()
    if db:
        try:
            result = (
                db.table("vintage_ratings")
                .select("*")
                .eq("year", year)
                .eq("zone", zone)
                .limit(1)
                .execute()
            )
            if result.data:
                return result.data[0]
        except Exception as e:
            logger.error(f"get_vintage_rating error: {e}")

    # Fallback to hardcoded data
    rating = VINTAGE_FALLBACK.get(year)
    if rating:
        return {"year": year, "zone": zone, **rating}
    return None


# ─── Search Log ───────────────────────────────────────────────────────────────

def log_search(query: str, grand_cru_id: Optional[str], vintage: Optional[int], response_ms: int):
    """Log search for analytics."""
    db = get_client()
    if not db:
        return
    try:
        db.table("search_log").insert({
            "query": query,
            "grand_cru_id": grand_cru_id,
            "vintage": vintage,
            "response_ms": response_ms,
            "searched_at": datetime.now(timezone.utc).isoformat(),
        }).execute()
    except Exception as e:
        logger.error(f"log_search error: {e}")
