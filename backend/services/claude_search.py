"""
Claude API Pricing Service
Uses Claude's built-in web search to fetch real wine prices live.
Cost: ~$0.003 per search. Cached in Supabase for 24hrs = nearly free at scale.
"""

import os
import json
import logging
from typing import Optional
import anthropic

logger = logging.getLogger("burgreport.claude_search")

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

# All 33 Grand Cru AOCs for context
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


def get_wine_price(wine_name: str, vintage: Optional[int] = None) -> dict:
    """
    Use Claude with web search to fetch live retail prices for a Grand Cru wine.
    Returns structured JSON with pricing data.
    """
    vintage_str = str(vintage) if vintage else "most recent available vintage"

    logger.info(f"Claude web search: {wine_name} {vintage_str}")

    prompt = f"""Search for the current retail price of {wine_name} {vintage_str} Grand Cru Burgundy wine.

Search these sites: wine-searcher.com, vivino.com, wine.com, klwines.com, wineaccess.com, totalwine.com

Return ONLY a valid JSON object. No explanation, no markdown, no code blocks. Just raw JSON:
{{
    "avg_price_usd": <number or null>,
    "min_price_usd": <number or null>,
    "max_price_usd": <number or null>,
    "merchant_count": <integer or null>,
    "critic_score": <number 0-100 or null>,
    "critic_name": "<which critic gave the score, e.g. Wine Advocate or null>",
    "drinking_window": "<e.g. 2024-2035 or null>",
    "sources": ["<merchant name 1>", "<merchant name 2>"],
    "confidence": "<high, medium, or low>",
    "notes": "<any useful context about price trends, availability, or scarcity — 1 sentence max or null>"
}}"""

    try:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=600,
            tools=[{"type": "web_search_20250305", "name": "web_search"}],
            messages=[{"role": "user", "content": prompt}],
        )

        # Web search returns many content blocks: server_tool_use,
        # web_search_tool_result, then multiple text blocks (with citations).
        # The JSON answer is typically in the last text block.
        # Concatenate all text blocks, then extract JSON from the result.
        all_text = "".join(
            block.text for block in response.content if block.type == "text" and block.text
        )
        logger.debug(f"Raw combined text ({len(all_text)} chars): {all_text[:300]}")

        # Try to extract JSON from markdown code fences first
        if "```" in all_text:
            for segment in all_text.split("```"):
                segment = segment.strip()
                if segment.startswith("json"):
                    segment = segment[4:].strip()
                try:
                    data = json.loads(segment)
                    if isinstance(data, dict) and "avg_price_usd" in data:
                        data["source"] = "claude_web_search"
                        logger.info(f"Claude search success: {wine_name} avg=${data.get('avg_price_usd')}")
                        return data
                except (json.JSONDecodeError, ValueError):
                    continue

        # Fallback: find the last JSON object in the combined text
        last_json_start = all_text.rfind("{")
        if last_json_start != -1:
            # Find matching closing brace
            depth = 0
            for i in range(last_json_start, len(all_text)):
                if all_text[i] == "{":
                    depth += 1
                elif all_text[i] == "}":
                    depth -= 1
                    if depth == 0:
                        candidate = all_text[last_json_start:i + 1]
                        try:
                            data = json.loads(candidate)
                            data["source"] = "claude_web_search"
                            logger.info(f"Claude search success: {wine_name} avg=${data.get('avg_price_usd')}")
                            return data
                        except json.JSONDecodeError as e:
                            logger.error(f"JSON parse error: {e}\nCandidate: {candidate[:200]}")
                        break

        logger.error(f"No valid JSON found in response for {wine_name}. Text: {all_text[:300]}")

    except Exception as e:
        logger.error(f"Claude API error for {wine_name}: {e}")

    # Return empty structure on failure
    return {
        "avg_price_usd": None,
        "min_price_usd": None,
        "max_price_usd": None,
        "merchant_count": None,
        "critic_score": None,
        "critic_name": None,
        "drinking_window": None,
        "sources": [],
        "confidence": "low",
        "notes": "Price data temporarily unavailable",
        "source": "error",
    }


def get_wine_info(wine_name: str) -> dict:
    """
    Use Claude to get general information about a Grand Cru climat.
    Used as fallback when Airtable is not configured.
    """
    prompt = f"""What is {wine_name} Grand Cru Burgundy?

Return ONLY valid JSON, no other text:
{{
    "name": "{wine_name}",
    "aoc": "<full AOC name>",
    "village": "<commune/village>",
    "cote": "<Côte de Nuits or Côte de Beaune>",
    "size_ha": <hectares as number or null>,
    "is_monopole": <true or false>,
    "description": "<2-3 sentence description of the climat, its terroir and style>",
    "key_producers": ["<producer 1>", "<producer 2>", "<producer 3>"],
    "food_pairings": ["<pairing 1>", "<pairing 2>", "<pairing 3>"],
    "color": "<Red or White>"
}}"""

    try:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=600,
            messages=[{"role": "user", "content": prompt}],
        )
        for block in response.content:
            if block.type == "text":
                text = block.text.strip()
                if "```" in text:
                    text = text.split("```")[1]
                    if text.startswith("json"):
                        text = text[4:]
                return json.loads(text.strip())
    except Exception as e:
        logger.error(f"Claude wine info error: {e}")

    return {"name": wine_name, "description": None}
