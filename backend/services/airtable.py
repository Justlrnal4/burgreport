"""
Airtable Service
Fetches curated Grand Cru content: descriptions, food pairings, producers.
Falls back to seed data if Airtable is not configured.
"""

import os
import time
import logging
from typing import Optional
import httpx
from services import reference_data

logger = logging.getLogger("burgreport.airtable")

AIRTABLE_TOKEN = os.getenv("AIRTABLE_TOKEN")
BASE_ID = os.getenv("AIRTABLE_BASE_ID")
GRAND_CRUS_TABLE = os.getenv("AIRTABLE_GRAND_CRUS_TABLE", "Grand Crus")

# In-memory cache for all climats (1 hour TTL)
_climats_cache: dict = {}
_cache_expires: float = 0


# ─── Seed fallback data ───────────────────────────────────────────────────────

SEED_CLIMATS = {
    "La Romanée-Conti": {
        "name": "La Romanée-Conti",
        "aoc": "La Romanée-Conti Grand Cru",
        "village": "Vosne-Romanée",
        "cote": "Côte de Nuits",
        "size_ha": 1.8,
        "is_monopole": True,
        "description": "The most celebrated and expensive red wine in the world. A monopole of Domaine de la Romanée-Conti, this 1.8-hectare plot produces wines of unparalleled complexity, combining silky tannins with extraordinary depth and longevity.",
        "key_producers": ["Domaine de la Romanée-Conti"],
        "food_pairings": ["Aged Époisses", "Truffle risotto", "Roasted game birds"],
        "color": "Red",
    },
    "La Tâche": {
        "name": "La Tâche",
        "aoc": "La Tâche Grand Cru",
        "village": "Vosne-Romanée",
        "cote": "Côte de Nuits",
        "size_ha": 6.1,
        "is_monopole": True,
        "description": "A DRC monopole producing wines of breathtaking complexity. La Tâche expresses a broader, more muscular style than Romanée-Conti — rich in dark fruit, spice, and an almost ethereal minerality.",
        "key_producers": ["Domaine de la Romanée-Conti"],
        "food_pairings": ["Duck confit", "Truffle dishes", "Aged hard cheeses"],
        "color": "Red",
    },
    "Chambertin": {
        "name": "Chambertin",
        "aoc": "Chambertin Grand Cru",
        "village": "Gevrey-Chambertin",
        "cote": "Côte de Nuits",
        "size_ha": 12.9,
        "is_monopole": False,
        "description": "Napoleon's favourite wine. Chambertin produces the most powerful and structured wines in the Côte de Nuits — brooding dark fruit, iron minerality, and the ability to age for decades.",
        "key_producers": ["Rossignol-Trapet", "Trapet", "Leroy", "Rousseau", "Ponsot"],
        "food_pairings": ["Roasted lamb", "Wild boar", "Aged Comté"],
        "color": "Red",
    },
    "Montrachet": {
        "name": "Montrachet",
        "aoc": "Montrachet Grand Cru",
        "village": "Puligny-Montrachet / Chassagne-Montrachet",
        "cote": "Côte de Beaune",
        "size_ha": 8.0,
        "is_monopole": False,
        "description": "The world's greatest dry white wine. Montrachet produces Chardonnay of incomparable richness and precision — honeyed, nutty, with a laser-focus minerality that can age for 20+ years.",
        "key_producers": ["DRC", "Comtes Lafon", "Leflaive", "Ramonet", "Bouchard"],
        "food_pairings": ["Lobster", "Sole meunière", "White truffle pasta"],
        "color": "White",
    },
    "Musigny": {
        "name": "Musigny",
        "aoc": "Musigny Grand Cru",
        "village": "Chambolle-Musigny",
        "cote": "Côte de Nuits",
        "size_ha": 10.7,
        "is_monopole": False,
        "description": "The most feminine and ethereal of the Côte de Nuits grands crus. Musigny is all violet fragrance, silky texture, and haunting precision — the very definition of Burgundy's seductive grace.",
        "key_producers": ["de Vogüé", "Leroy", "Roumier", "Drouhin", "Mugnier"],
        "food_pairings": ["Roasted pigeon", "Duck breast", "Mild soft cheeses"],
        "color": "Red",
    },
}


def get_climat_data(name: str) -> Optional[dict]:
    """Get curated data for a Grand Cru climat."""
    if AIRTABLE_TOKEN and BASE_ID:
        data = _fetch_from_airtable(name)
        if data:
            return data

    reference = reference_data.find_climat(name)
    if reference:
        return reference

    # Fallback: exact match in seed data
    for key, val in SEED_CLIMATS.items():
        if key.lower() == name.lower() or name.lower() in key.lower():
            return val

    return None


def get_all_climats() -> list:
    """Return all climats for autocomplete — cached 1 hour."""
    global _climats_cache, _cache_expires

    if time.time() < _cache_expires and _climats_cache:
        return list(_climats_cache.values())

    if AIRTABLE_TOKEN and BASE_ID:
        records = _fetch_all_from_airtable()
        if records:
            _climats_cache = {r["name"]: r for r in records}
            _cache_expires = time.time() + 3600
            return records

    return reference_data.list_climats()


# ─── Airtable API calls ───────────────────────────────────────────────────────

def _fetch_from_airtable(name: str) -> Optional[dict]:
    try:
        url = f"https://api.airtable.com/v0/{BASE_ID}/{GRAND_CRUS_TABLE}"
        headers = {"Authorization": f"Bearer {AIRTABLE_TOKEN}"}
        params = {"filterByFormula": f"SEARCH('{name}', {{Name}})"}
        with httpx.Client(timeout=10) as client:
            r = client.get(url, headers=headers, params=params)
            r.raise_for_status()
            records = r.json().get("records", [])
            if records:
                fields = records[0]["fields"]
                return _map_airtable_fields(fields)
    except Exception as e:
        logger.error(f"Airtable fetch error for {name}: {e}")
    return None


def _fetch_all_from_airtable() -> list:
    try:
        url = f"https://api.airtable.com/v0/{BASE_ID}/{GRAND_CRUS_TABLE}"
        headers = {"Authorization": f"Bearer {AIRTABLE_TOKEN}"}
        with httpx.Client(timeout=15) as client:
            r = client.get(url, headers=headers)
            r.raise_for_status()
            records = r.json().get("records", [])
            return [_map_airtable_fields(rec["fields"]) for rec in records]
    except Exception as e:
        logger.error(f"Airtable fetch all error: {e}")
    return []


def _map_airtable_fields(fields: dict) -> dict:
    return {
        "name": fields.get("Name", ""),
        "aoc": fields.get("AOC", ""),
        "village": fields.get("Village", ""),
        "cote": fields.get("Cote", ""),
        "size_ha": fields.get("Size (ha)"),
        "is_monopole": fields.get("Is Monopole", False),
        "description": fields.get("Description", ""),
        "key_producers": fields.get("Key Producers", []),
        "food_pairings": fields.get("Food Pairings", []),
        "color": fields.get("Color", "Red"),
    }
