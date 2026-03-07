"""
Vintages Router
GET /api/vintages — return all vintage ratings 2005-2023
GET /api/vintages/{year} — get rating for a specific year
"""

import logging
from fastapi import APIRouter, HTTPException
from services import supabase_client
from services.supabase_client import get_vintage_rating, VINTAGE_FALLBACK

logger = logging.getLogger("burgreport.vintages")

router = APIRouter(prefix="/api/vintages", tags=["vintages"])


@router.get("")
async def list_vintages():
    """Return all vintage ratings."""
    # Try Supabase first
    db = supabase_client.get_client()
    if db:
        try:
            result = db.table("vintage_ratings").select("*").order("year", desc=True).execute()
            if result.data:
                return {"count": len(result.data), "vintages": result.data}
        except Exception as e:
            logger.error(f"list_vintages DB error: {e}")
    # Fallback to hardcoded
    ratings = []
    for year in sorted(VINTAGE_FALLBACK.keys(), reverse=True):
        rating = get_vintage_rating(year)
        if rating:
            ratings.append(rating)
    return {"count": len(ratings), "vintages": ratings}


@router.get("/{year}")
async def get_vintage(year: int):
    """Get vintage rating for a specific year."""
    if year < 1990 or year > 2030:
        raise HTTPException(status_code=400, detail="Year must be between 1990 and 2030")
    rating = get_vintage_rating(year)
    if not rating:
        raise HTTPException(status_code=404, detail=f"No vintage data for {year}")
    return rating
