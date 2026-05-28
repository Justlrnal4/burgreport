"""Scheduled price refresh worker for Supabase cache updates."""

import argparse
import json
import time
import logging
import os
from dotenv import load_dotenv

load_dotenv()

from services import openai_search, supabase_client, tavily_search
from services.reference_data import GRAND_CRUS as _GRAND_CRU_DEFS
from services.reference_data import normalize_name

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("burgreport.refresh")

GRAND_CRUS = [item["name"] for item in _GRAND_CRU_DEFS]

TOP_VINTAGES = [2015, 2018, 2019, 2020, 2022]


def _jobs(wines: list[str], vintages: list[int]) -> list[tuple[str, int]]:
    return [(wine, vintage) for wine in wines for vintage in vintages]


def _load_state(state_file: str | None) -> int:
    if not state_file or not os.path.exists(os.path.expanduser(state_file)):
        return 0
    try:
        with open(os.path.expanduser(state_file), "r", encoding="utf-8") as handle:
            return int(json.load(handle).get("next_index", 0))
    except (OSError, ValueError, TypeError, json.JSONDecodeError):
        logger.warning("Could not read refresh state file; starting at index 0")
        return 0


def _save_state(state_file: str | None, next_index: int):
    if not state_file:
        return
    path = os.path.expanduser(state_file)
    directory = os.path.dirname(path)
    if directory:
        os.makedirs(directory, exist_ok=True)
    with open(path, "w", encoding="utf-8") as handle:
        json.dump({"next_index": next_index}, handle)


def _select_jobs(
    jobs: list[tuple[str, int]],
    limit: int | None,
    state_file: str | None = None,
) -> tuple[list[tuple[str, int]], int]:
    if not jobs:
        return [], 0
    if not limit or limit >= len(jobs):
        return jobs, 0

    start = _load_state(state_file) % len(jobs)
    selected = [jobs[(start + offset) % len(jobs)] for offset in range(limit)]
    return selected, (start + limit) % len(jobs)


def _parse_vintages(raw: str | None) -> list[int]:
    if not raw:
        return TOP_VINTAGES
    return [int(value.strip()) for value in raw.split(",") if value.strip()]


def _parse_wines(raw: str | None) -> list[str]:
    if not raw:
        return GRAND_CRUS
    wanted = {normalize_name(value.strip()) for value in raw.split(",") if value.strip()}
    return [wine for wine in GRAND_CRUS if normalize_name(wine) in wanted]


def _price_provider(name: str):
    if name == "auto":
        return tavily_search if os.getenv("TAVILY_API_KEY") else openai_search
    if name == "tavily":
        return tavily_search
    if name == "openai":
        return openai_search
    raise ValueError(f"Unknown price refresh provider: {name}")


def refresh_all(
    provider_name: str = "auto",
    limit: int | None = None,
    sleep_seconds: float = 1.0,
    state_file: str | None = None,
    wines: list[str] | None = None,
    vintages: list[int] | None = None,
    dry_run: bool = False,
):
    provider = _price_provider(provider_name)
    all_jobs = _jobs(wines or GRAND_CRUS, vintages or TOP_VINTAGES)
    selected_jobs, next_index = _select_jobs(all_jobs, limit, state_file)
    total = len(selected_jobs)
    success = 0
    errors = 0
    start = time.time()

    logger.info("Starting price refresh: %s combos via %s", total, provider.__name__.split(".")[-1])

    for wine, vintage in selected_jobs:
        try:
            if dry_run:
                logger.info("DRY RUN %s %s", wine, vintage)
                success += 1
                continue

            price_data = provider.get_wine_price(wine, vintage)
            if price_data.get("avg_price_usd"):
                grand_cru = supabase_client.get_grand_cru(wine)
                grand_cru_id = supabase_client.canonical_grand_cru_id(wine, grand_cru)
                if supabase_client.set_cached_price(grand_cru_id, vintage, price_data):
                    success += 1
                    logger.info("%s %s - cached $%s", wine, vintage, price_data["avg_price_usd"])
                else:
                    errors += 1
            else:
                logger.warning("%s %s - %s", wine, vintage, price_data.get("source", "no_price"))
                errors += 1
            time.sleep(sleep_seconds)
        except Exception as exc:
            logger.error("Error for %s %s: %s", wine, vintage, exc)
            errors += 1
            time.sleep(max(sleep_seconds, 2.0))

    if not dry_run:
        _save_state(state_file, next_index)
    elapsed = int(time.time() - start)
    logger.info("Refresh complete: %s success, %s errors, %ss elapsed", success, errors, elapsed)


def main():
    parser = argparse.ArgumentParser(description="Refresh BurgReport price cache in Supabase.")
    parser.add_argument("--provider", default=os.getenv("PRICE_REFRESH_PROVIDER", "auto"), choices=["auto", "openai", "tavily"])
    parser.add_argument("--limit", type=int, default=int(os.getenv("PRICE_REFRESH_LIMIT", "0")) or None)
    parser.add_argument("--sleep-seconds", type=float, default=float(os.getenv("PRICE_REFRESH_SLEEP_SECONDS", "1.0")))
    parser.add_argument("--state-file", default=os.getenv("PRICE_REFRESH_STATE_FILE"))
    parser.add_argument("--wines", default=os.getenv("PRICE_REFRESH_WINES"))
    parser.add_argument("--vintages", default=os.getenv("PRICE_REFRESH_VINTAGES"))
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    refresh_all(
        provider_name=args.provider,
        limit=args.limit,
        sleep_seconds=args.sleep_seconds,
        state_file=args.state_file,
        wines=_parse_wines(args.wines),
        vintages=_parse_vintages(args.vintages),
        dry_run=args.dry_run,
    )


if __name__ == "__main__":
    main()
