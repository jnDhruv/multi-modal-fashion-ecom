"""
response.py — API Response Schema
===================================
Defines what returns after Gemini generates style notes.
returns:
{
    "products": [
        {
            "id": 102,
            "title": "Oversized Cotton Hoodie",
            "price": 1499,
            "image_url": "...",
            "category": "Hoodie",
            "color": "Black",
            "fit": "Oversized",
            "season": "Winter",
            "style_note": "This hoodie matches your search because..."
        }
    ],
    "query": "black oversized hoodie for winter",
    "total": 1,
    "ai_generated": true
}
"""

from pydantic import BaseModel, Field
from typing import List, Optional


class ProductWithStyleNote(BaseModel):
    """
    A product enriched with an AI-generated style note from Gemini.
    This is what React displays on the product card.
    """

    # Core identifiers (always present)
    id: int = Field(..., description="Product ID — maps back to ml model's product")
    title: str = Field(..., description="Product title")

    # Optional metadata for display
    category: Optional[str] = Field(None, description="Product category")
    color: Optional[str] = Field(None, description="Product color")
    material: Optional[str] = Field(None, description="Product material")
    fit: Optional[str] = Field(None, description="Product fit type")
    season: Optional[str] = Field(None, description="Season suitability")
    style: Optional[str] = Field(None, description="Style descriptor")
    gender: Optional[str] = Field(None, description="Target gender")
    brand: Optional[str] = Field(None, description="Brand name")
    price: Optional[float] = Field(None, description="Price in INR (₹)")
    image_url: Optional[str] = Field(None, description="Product image URL")
    similarity_score: Optional[float] = Field(None, description="Retrieval similarity score")

    # The AI-generated explanation — this is core output
    style_note: Optional[str] = Field(
        None,
        description="AI-generated explanation of why this product matches the user's request"
    )

    # Flag if AI generation failed for this specific product
    ai_note_available: bool = Field(
        True,
        description="Whether the AI style note was successfully generated"
    )


class StyleNotesResponse(BaseModel):
    """
    The complete response from POST /api/style-notes.
    Contains all products enriched with AI style notes.
    """

    products: List[ProductWithStyleNote] = Field(
        ...,
        description="Products with AI-generated style notes"
    )

    query: str = Field(
        ...,
        description="The original user search query"
    )

    total: int = Field(
        ...,
        description="Total number of products returned"
    )

    ai_generated: bool = Field(
        True,
        description="Whether AI style notes were successfully generated"
    )

    search_mode: Optional[str] = Field(
        "text",
        description="Search mode used: text or image"
    )

    error_message: Optional[str] = Field(
        None,
        description="Error message if something went wrong (partial failure)"
    )


class HealthResponse(BaseModel):
    """Response for the health check endpoint."""
    status: str
    gemini_configured: bool
    version: str = "1.0.0"
    message: str


class MockSearchResponse(BaseModel):
    """Response from the mock search endpoint."""
    user_query: str
    products: list
    total: int
    source: str = "mock"
