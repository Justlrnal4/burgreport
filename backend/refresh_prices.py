"""
Nightly Price Refresh Script
Refreshes prices for all 33 Grand Crus × top vintages via OpenAI web search.
Run nightly at 3 AM via Railway cron: 0 3 * * *
"""

import time
import logging
from dotenv import load_dotenv

load_dotenv()

from services import openai_search, supabase_client

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("burgreport.refresh")

GRAND_CRUS = [
    "Chambertin", "Chambertin-Clos de Bèze", "Chapelle-Chambertin",
    "Charmes-Chambertin", "Griotte-Chambertin", "Latricières-Chambertin",
    "Mazis-Chambertin", "Clos de la Roche", "Clos Saint-Denis",
    "Clos des Lambrays", "Clos de Tart", "Clos Vougeot",
    "Échézeaux", "Grands Échézeaux", "La Romanée",
    "La Romanée-Conti", "La Tâche", "Richebourg",
    "Romanée-Saint-Vivant", "La Grande Rue", "Corton",
    "Corton-Charlemagne", "Musigny", "Montrachet",
    "Bâtard-Montrachet", "Chevalier-Montrachet",
    "Bonnes-Mares",
]

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
                    supabase_client.set_cached_price(wine.lower().replace(" ", "_"), vintage, price_data)
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
