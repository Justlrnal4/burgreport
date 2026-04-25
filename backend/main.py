"""
Burg Report — FastAPI Backend
Grand Cru Burgundy Pricing Intelligence
"""

import time
import logging
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from routers import search, wines, vintages

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("burgreport")

LOCAL_CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]


def get_cors_origins(raw_origins: str | None = None) -> list[str]:
    """Return explicit CORS origins; never default to wildcard origins."""
    raw = os.getenv("CORS_ORIGINS") if raw_origins is None else raw_origins
    if not raw:
        return LOCAL_CORS_ORIGINS

    origins = []
    for origin in raw.split(","):
        cleaned = origin.strip().rstrip("/")
        if cleaned and cleaned not in origins:
            origins.append(cleaned)

    return origins or LOCAL_CORS_ORIGINS


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🍷 Burg Report API starting...")
    yield
    logger.info("Burg Report API shutting down.")


app = FastAPI(
    title="Burg Report API",
    description="Grand Cru Burgundy Pricing Intelligence",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(search.router)
app.include_router(wines.router)
app.include_router(vintages.router)


@app.get("/health")
async def health():
    return {"status": "ok", "version": "1.0.0", "service": "Burg Report API"}


@app.get("/")
async def root():
    return {
        "name": "Burg Report API",
        "docs": "/docs",
        "health": "/health",
    }
