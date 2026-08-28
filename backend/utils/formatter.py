"""
formatter.py — Response Formatting Utilities
==============================================
Helper functions for building clean, consistent API responses.
These ensure the JSON returned to React is well-structured.
"""

from typing import List, Dict, Optional
from app.schemas.product import Product
from app.schemas.response import ProductWithStyleNote, StyleNotesResponse


def build_product_with_style_note(
    product: Product,
    style_notes: Dict[int, str],
    user_query: str = ""
) -> ProductWithStyleNote:
    """
    Merges a Product object with its AI-generated style note.

    Takes:
    - The original Product (from Pydantic validation)
    - The style_notes dictionary {product_id: note_text}

    Returns a ProductWithStyleNote ready to be sent to React.
    """

    # Look up the style note for this product
    style_note = style_notes.get(product.id)
    ai_note_available = style_note is not None and len(style_note.strip()) > 0

    return ProductWithStyleNote(
        id=product.id,
        title=product.title,
        category=product.category,
        color=product.color,
        material=product.material,
        fit=product.fit,
        season=product.season,
        style=product.style,
        gender=product.gender,
        brand=product.brand,
        price=product.price,
        image_url=product.image_url,
        similarity_score=product.similarity_score,
        style_note=style_note or "AI explanation unavailable for this product.",
        ai_note_available=ai_note_available
    )


def build_style_notes_response(
    products: List[Product],
    style_notes: Dict[int, str],
    user_query: str,
    search_mode: str = "text",
    error_message: Optional[str] = None
) -> StyleNotesResponse:
    """
    Builds the complete API response object.

    This is what FastAPI returns to React as JSON.
    """

    # Enrich each product with its style note
    enriched_products = [
        build_product_with_style_note(product, style_notes, user_query)
        for product in products
    ]

    # Check if AI was actually used
    ai_generated = any(p.ai_note_available for p in enriched_products)

    return StyleNotesResponse(
        products=enriched_products,
        query=user_query,
        total=len(enriched_products),
        ai_generated=ai_generated,
        search_mode=search_mode,
        error_message=error_message
    )


def format_price_inr(price: Optional[float]) -> str:
    """Format a price value as Indian Rupees string."""
    if price is None:
        return "Price not available"
    return f"₹{price:,.0f}"
