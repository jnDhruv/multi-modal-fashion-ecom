"""
style_routes.py — API Route Definitions
=========================================
Defines all FastAPI routes for backend's module.

Routes:
- GET  /api/health          — Health check (is the server running?)
- POST /api/style-notes     — Main endpoint: receive products, return AI notes
- POST /api/mock-search     — Development: simulate ml model's retrieval
- GET  /api/mock-products   — Development: view all mock products

The route file stays thin — all business logic is in services/.
"""

import logging
from fastapi import APIRouter, HTTPException, status
from typing import Optional

from app.schemas.request import StyleNotesRequest, MockSearchRequest
from app.schemas.response import StyleNotesResponse, HealthResponse, MockSearchResponse
from app.services.gemini_service import generate_style_notes_batch, is_gemini_configured
from app.utils.formatter import build_style_notes_response
from app.mock.mock_products import get_mock_products_by_query, get_all_mock_products

logger = logging.getLogger(__name__)

# Create the router — this gets registered in main.py
router = APIRouter(prefix="/api", tags=["Style Notes"])


# ─── Health Check ─────────────────────────────────────────────────────────────

@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health Check",
    description="Check if the server and Gemini API are configured correctly."
)
async def health_check():
    """
    Returns the server status and whether Gemini is configured.
    Use this to verify the backend is running before testing.
    """
    gemini_ok = is_gemini_configured()

    return HealthResponse(
        status="ok",
        gemini_configured=gemini_ok,
        version="1.0.0",
        message=(
            "Gemini API is configured and ready."
            if gemini_ok
            else "Warning: GEMINI_API_KEY is not set. Style notes will use fallback text."
        )
    )


# ─── Main Endpoint: Style Notes ───────────────────────────────────────────────

@router.post(
    "/style-notes",
    response_model=StyleNotesResponse,
    summary="Generate AI Style Notes",
    description="""
    **Main backend Endpoint**

    Receives retrieved products from ml model (or mock data) along with
    the user's original search query, then uses Gemini to generate
    personalized AI style notes explaining why each product matches.

    **Flow:**
    1. Validate request with Pydantic
    2. Extract product metadata
    3. Build prompt for Gemini
    4. Call Gemini API
    5. Parse and validate response
    6. Return enriched products with style notes
    """,
    status_code=status.HTTP_200_OK
)
async def generate_style_notes(request: StyleNotesRequest):
    """
    Generate AI-powered style notes for retrieved fashion products.
    This is the core endpoint of backend's module.
    """

    logger.info(
        f"Style notes requested for query: '{request.user_query}' "
        f"with {len(request.products)} products"
    )

    if not request.products:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No products provided. Please include at least one product."
        )

    try:
        # Step 1: Generate style notes for all products using Gemini
        style_notes = generate_style_notes_batch(
            user_query=request.user_query,
            products=request.products
        )

        # Step 2: Build the structured response
        response = build_style_notes_response(
            products=request.products,
            style_notes=style_notes,
            user_query=request.user_query,
            search_mode=request.search_mode or "text"
        )

        logger.info(
            f"Successfully generated {len(response.products)} style notes. "
            f"AI generated: {response.ai_generated}"
        )

        return response

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in generate_style_notes: {e}", exc_info=True)

        # Attempt graceful degradation — return products without AI notes
        try:
            fallback_notes = {p.id: "AI explanation temporarily unavailable." for p in request.products}
            response = build_style_notes_response(
                products=request.products,
                style_notes=fallback_notes,
                user_query=request.user_query,
                search_mode=request.search_mode or "text",
                error_message="AI explanation service encountered an error. Showing products without explanations."
            )
            return response
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Internal server error: {str(e)}"
            )


# ─── Mock Search (Development Only) ──────────────────────────────────────────

@router.post(
    "/mock-search",
    response_model=MockSearchResponse,
    summary="Mock Product Search (Development)",
    description="""
    **Development Only — Simulates ml model's Retrieval**

    In production, ml model's CLIP model retrieves products.
    During development, this endpoint returns mock products that
    loosely match the query using keyword matching.

    Use this to test the full pipeline without ml model.
    """
)
async def mock_search(request: MockSearchRequest):
    """
    Simulate ml model's product retrieval using mock data.
    Returns products that keyword-match the query.
    """

    logger.info(f"Mock search for: '{request.query}' (top_k={request.top_k})")

    products = get_mock_products_by_query(
        query=request.query,
        top_k=request.top_k or 6
    )

    return MockSearchResponse(
        user_query=request.query,
        products=products,
        total=len(products),
        source="mock"
    )


# ─── View All Mock Products ───────────────────────────────────────────────────

@router.get(
    "/mock-products",
    summary="List All Mock Products (Development)",
    description="Returns all available mock products. Used for development and testing."
)
async def get_mock_products():
    """
    Return all mock products for development inspection.
    """
    products = get_all_mock_products()
    return {
        "products": products,
        "total": len(products),
        "source": "mock"
    }
