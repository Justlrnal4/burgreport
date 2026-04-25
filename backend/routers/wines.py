"""
Wines Router
GET /api/wines — list all 33 Grand Crus (for autocomplete/search UI)
GET /api/wines/{name} — get details for a specific climat
"""

import logging
from fastapi import APIRouter, HTTPException
from services import airtable, reference_data, supabase_client

logger = logging.getLogger("burgreport.wines")

router = APIRouter(prefix="/api/wines", tags=["wines"])


@router.get("")
async def list_wines():
    """Return all 33 Grand Crus — used for search autocomplete."""
    # Try Supabase first, fall back to Airtable/seed data
    wines = supabase_client.get_all_grand_crus()
    if not wines:
        climats = airtable.get_all_climats()
        wines = [
            {
                "name": c.get("name"),
                "aoc": c.get("aoc"),
                "village": c.get("village"),
                "cote": c.get("cote"),
                "color": c.get("color", "Red"),
                "grape": c.get("grape"),
                "size_ha": c.get("size_ha"),
                "is_monopole": c.get("is_monopole", False),
                "aliases": c.get("aliases", []),
            }
            for c in climats
        ]
    return {"count": len(wines), "wines": wines}


@router.get("/{wine_name}")
async def get_wine(wine_name: str):
    """Get full details for a specific Grand Cru climat."""
    reference = reference_data.find_climat(wine_name)
    climat = reference or supabase_client.get_grand_cru(wine_name)
    if not climat:
        climat = airtable.get_climat_data(wine_name)
    if not climat or not climat.get("name"):
        raise HTTPException(status_code=404, detail=f"Wine '{wine_name}' not found")
    return climat
