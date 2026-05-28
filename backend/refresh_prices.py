"""
Nightly Price Refresh Script
Refreshes prices for all 34 Grand Crus × top vintages via OpenAI web search.
Run nightly at 3 AM via Railway cron: 0 3 * * *
"""

import time
import logging
from dotenv import load_dotenv

load_dotenv()

from services import openai_search, supabase_client
from services.reference_data import GRAND_CRUS as _GRAND_CRU_DEFS

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("burgreport.refresh")

GRAND_CRUS = [item["name"] for item in _GRAND_CRU_DEFS]

TOP_VINTAGES = [2015, 2018, 2019, 2020, 2022]


def refresh_all():
    total = len(GRAND_CRUS) * len(TOP_VINTAGES)
    success = 0
    errors = 0
    start = time.time()

    logger.info(f"Starting nightly refresh: {total} wine+vintage combos")

    for wine in GRAND_CRUS:
        for vintage in TOP_VINTAGES:
            try:
                price_data = openai_search.get_wine_price(wine, vintage)
                if price_data.get("avg_price_usd"):
                    grand_cru_id = supabase_client.canonical_grand_cru_id(wine)
                    supabase_client.set_cached_price(grand_cru_id, vintage, price_data)
                    success += 1
                    logger.info(f"✓ {wine} {vintage} — ${price_data['avg_price_usd']}")
                else:
                    logger.warning(f"✗ {wine} {vintage} — no price found")
                    errors += 1
                time.sleep(1.0)  # Rate limit: 1 second between calls
            except Exception as e:
                logger.error(f"Error for {wine} {vintage}: {e}")
                errors += 1
                time.sleep(2.0)

    elapsed = int(time.time() - start)
    logger.info(f"Refresh complete: {success} success, {errors} errors, {elapsed}s elapsed")


if __name__ == "__main__":
    refresh_all()
