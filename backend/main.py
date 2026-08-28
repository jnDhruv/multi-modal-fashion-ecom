"""
main.py — FastAPI Application Entry Point
==========================================
This is the main file that starts the FastAPI server.
It is intentionally kept small — all logic lives in routes/ and services/.

backend's FastAPI backend:
- Receives products from ml model (or mock data)
- Processes metadata
- Calls Gemini API
- Returns AI-enriched product data to React
"""

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.settings import settings
from app.routes.style_routes import router

# ─── Logging Setup ─────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s — %(name)s — %(levelname)s — %(message)s"
)
logger = logging.getLogger(__name__)


# ─── FastAPI App ────────────────────────────────────────────────────────────
app = FastAPI(
    title="backend — AI Fashion Style Notes API",
    description="""
## Multi-Modal Product Search & Visual Discovery Engine
### backend: LLM Integration + Full Stack Application

This API is responsible for generating AI-powered style notes
that explain why retrieved fashion products match the user's search query.

**Architecture:**
```
ml model (CLIP Retrieval) → backend (FastAPI + Gemini) → React Frontend
```

**Main Endpoint:**
- `POST /api/style-notes` — Receive products, generate AI explanations

**Development Endpoints:**
- `POST /api/mock-search` — Simulate ml model's retrieval
- `GET  /api/mock-products` — View all mock products
- `GET  /api/health` — Server health check
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)


# ─── CORS Configuration ─────────────────────────────────────────────────────
# This allows React (running on a different port) to talk to FastAPI.
# Without CORS, the browser blocks cross-origin requests.

allowed_origins = settings.get_allowed_origins()

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

logger.info(f"CORS configured for origins: {allowed_origins}")


# ─── Routes ─────────────────────────────────────────────────────────────────
# Register all routes from style_routes.py
app.include_router(router)


# ─── Root Endpoint ──────────────────────────────────────────────────────────
@app.get("/", tags=["Root"])
async def root():
    """Root endpoint — confirms the server is running."""
    return {
        "message": "backend — AI Fashion Style Notes API is running!",
        "docs": "/docs",
        "health": "/api/health",
        "main_endpoint": "POST /api/style-notes",
        "version": "1.0.0"
    }


# ─── Application Startup ────────────────────────────────────────────────────
@app.on_event("startup")
async def startup_event():
    """Runs when the FastAPI server starts."""
    logger.info("=" * 60)
    logger.info("backend — AI Fashion Style Notes API")
    logger.info("=" * 60)
    logger.info(f"Environment: {settings.APP_ENV}")
    logger.info(f"Mock mode: {settings.USE_MOCK_DATA}")
    logger.info(f"Gemini model: {settings.GEMINI_MODEL}")

    if not settings.GEMINI_API_KEY:
        logger.warning("⚠️  GEMINI_API_KEY is NOT set!")
        logger.warning("   Style notes will use fallback text.")
        logger.warning("   Set GEMINI_API_KEY in backend/.env to enable AI.")
    else:
        logger.info("✅ Gemini API key is configured.")

    logger.info(f"API Docs: http://localhost:{settings.APP_PORT}/docs")
    logger.info("=" * 60)


# ─── Run Directly ───────────────────────────────────────────────────────────
# Run with: uvicorn app.main:app --reload
# Or run this file directly: python app/main.py
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.APP_HOST,
        port=settings.APP_PORT,
        reload=True
    )
