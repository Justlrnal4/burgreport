"""
OpenAI pricing and climat service.

The backend treats OpenAI output as candidate data. Missing, unparseable, or
unsupported values return nulls so the frontend can show unavailable states.
"""

import json
import logging
import os
from typing import Optional

from openai import OpenAI

logger = logging.getLogger("burgreport.openai_search")

OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-5")
_client: Optional[OpenAI] = None

GRAND_CRUS = [
    "Chambertin", "Chambertin-Clos de Bèze", "Chapelle-Chambertin",
    "Charmes-Chambertin", "Griotte-Chambertin", "Latricières-Chambertin",
    "Mazis-Chambertin", "Mazoyères-Chambertin", "Ruchottes-Chambertin",
    "Bonnes-Mares", "Clos de la Roche", "Clos Saint-Denis",
    "Clos des Lambrays", "Clos de Tart", "Clos Vougeot",
    "Échézeaux", "Grands Échézeaux", "La Romanée",
    "La Romanée-Conti", "La Tâche", "Richebourg",
    "Romanée-Saint-Vivant", "La Grande Rue", "Corton",
    "Corton-Charlemagne", "Charlemagne", "Musigny",
    "Montrachet", "Bâtard-Montrachet", "Bienvenues-Bâtard-Montrachet",
    "Chevalier-Montrachet", "Criots-Bâtard-Montrachet", "Blagny",
]


PRICE_SCHEMA = {
    "type": "json_schema",
    "name": "burgreport_price_lookup",
    "schema": {
        "type": "object",
        "additionalProperties": False,
        "properties": {
            "avg_price_usd": {"type": ["number", "null"]},
            "min_price_usd": {"type": ["number", "null"]},
            "max_price_usd": {"type": ["number", "null"]},
            "merchant_count": {"type": ["integer", "null"]},
            "critic_score": {"type": ["number", "null"]},
            "critic_name": {"type": ["string", "null"]},
            "drinking_window": {"type": ["string", "null"]},
            "sources": {
                "type": "array",
                "items": {"type": "string"},
            },
            "confidence": {"type": "string", "enum": ["unavailable"]},
            "notes": {"type": ["string", "null"]},
        },
        "required": [
            "avg_price_usd",
            "min_price_usd",
            "max_price_usd",
            "merchant_count",
            "critic_score",
            "critic_name",
            "drinking_window",
            "sources",
            "confidence",
            "notes",
        ],
    },
    "strict": True,
}

INFO_SCHEMA = {
    "type": "json_schema",
    "name": "burgreport_climat_info",
    "schema": {
        "type": "object",
        "additionalProperties": False,
        "properties": {
            "name": {"type": "string"},
            "aoc": {"type": ["string", "null"]},
            "village": {"type": ["string", "null"]},
            "cote": {"type": ["string", "null"]},
            "size_ha": {"type": ["number", "null"]},
            "is_monopole": {"type": "boolean"},
            "description": {"type": ["string", "null"]},
            "key_producers": {
                "type": "array",
                "items": {"type": "string"},
            },
            "food_pairings": {
                "type": "array",
                "items": {"type": "string"},
            },
            "color": {"type": ["string", "null"]},
        },
        "required": [
            "name",
            "aoc",
            "village",
            "cote",
            "size_ha",
            "is_monopole",
            "description",
            "key_producers",
            "food_pairings",
            "color",
        ],
    },
    "strict": True,
}


def _empty_price(source: str = "openai_error") -> dict:
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
        "notes": "Price data temporarily unavailable",
        "source": source,
    }


def _get_client() -> Optional[OpenAI]:
    global _client
    if _client is not None:
        return _client
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return None
    _client = OpenAI(api_key=api_key)
    return _client


def _parse_json_output(output_text: str) -> Optional[dict]:
    try:
        data = json.loads(output_text)
    except json.JSONDecodeError as exc:
        logger.error(f"OpenAI JSON parse error: {exc}; text={output_text[:300]}")
        return None
    return data if isinstance(data, dict) else None


def get_wine_price(wine_name: str, vintage: Optional[int] = None) -> dict:
    """
    Use OpenAI with web search to look for retail price context.

    Values remain null unless the model can return a structured answer from
    searched sources. The frontend must still display missing values as
    unavailable rather than inventing substitutes.
    """
    openai_client = _get_client()
    if not openai_client:
        logger.warning("OPENAI_API_KEY is not set; price lookup unavailable")
        return _empty_price("openai_missing_key")

    vintage_str = str(vintage) if vintage else "most recent available vintage"
    logger.info(f"OpenAI web search: {wine_name} {vintage_str}")

    prompt = f"""Search for current retail price context for {wine_name} {vintage_str} Grand Cru Burgundy.

Only include price fields if they are directly supported by searched retail or merchant pages.
Do not infer merchant counts, critic scores, drinking windows, or confidence.
If a field is not clearly supported, return null for that field.
Always return "unavailable" for confidence until BurgReport has a verified scoring model.

Return JSON matching the requested schema."""

    try:
        response = openai_client.responses.create(
            model=OPENAI_MODEL,
            reasoning={"effort": "low"},
            tools=[{"type": "web_search"}],
            tool_choice="auto",
            text={"format": PRICE_SCHEMA},
            max_output_tokens=700,
            input=prompt,
        )
        data = _parse_json_output(response.output_text)
        if not data:
            return _empty_price("openai_parse_error")
        data["source"] = "openai_web_search"
        logger.info(f"OpenAI price lookup complete: {wine_name} avg=${data.get('avg_price_usd')}")
        return data
    except Exception as exc:
        logger.error(f"OpenAI price lookup error for {wine_name}: {exc}")
        return _empty_price()


def get_wine_info(wine_name: str) -> dict:
    """
    Use OpenAI for fallback climat context when curated data is unavailable.
    This should be a last resort behind Supabase/Airtable reference data.
    """
    openai_client = _get_client()
    if not openai_client:
        logger.warning("OPENAI_API_KEY is not set; wine info fallback unavailable")
        return {"name": wine_name, "description": None}

    prompt = f"""Return conservative reference information for {wine_name} Grand Cru Burgundy.

If you are not certain about a field, return null or an empty list. Do not invent producers,
sizes, or classifications."""

    try:
        response = openai_client.responses.create(
            model=OPENAI_MODEL,
            reasoning={"effort": "low"},
            text={"format": INFO_SCHEMA},
            max_output_tokens=700,
            input=prompt,
        )
        data = _parse_json_output(response.output_text)
        return data or {"name": wine_name, "description": None}
    except Exception as exc:
        logger.error(f"OpenAI wine info error for {wine_name}: {exc}")
        return {"name": wine_name, "description": None}
