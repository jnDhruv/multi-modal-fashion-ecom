"""
product.py — Product Pydantic Schema
======================================
Defines the shape of a single product object.
Most fields are Optional because ml model's metadata
may vary — not every product will have every field filled.
"""

from pydantic import BaseModel, Field
from typing import Optional


class Product(BaseModel):
    """
    Represents a single fashion product retrieved by ml model (CLIP retrieval).

    Fields are Optional so we handle partial metadata gracefully.
    ml model can send whatever fields it has, and we process what's available.
    """

    # Required fields — every product must have at least these
    id: int = Field(..., description="Unique product identifier")
    title: str = Field(..., description="Product name/title")

    # Optional metadata fields — fill in what's available
    category: Optional[str] = Field(None, description="Product category e.g. Hoodie, Jacket")
    color: Optional[str] = Field(None, description="Primary color of the product")
    material: Optional[str] = Field(None, description="Fabric/material e.g. Cotton, Polyester")
    fit: Optional[str] = Field(None, description="Fit type e.g. Slim, Regular, Oversized")
    season: Optional[str] = Field(None, description="Season suitability e.g. Winter, Summer")
    style: Optional[str] = Field(None, description="Style descriptor e.g. Casual, Formal")
    gender: Optional[str] = Field(None, description="Target gender e.g. Men, Women, Unisex")
    brand: Optional[str] = Field(None, description="Brand name if available")
    description: Optional[str] = Field(None, description="Free-text product description")

    # Price and image
    price: Optional[float] = Field(None, description="Product price in INR (₹)")
    image_url: Optional[str] = Field(None, description="URL of the product image")

    # Similarity score from ml model's retrieval (optional)
    similarity_score: Optional[float] = Field(None, description="Retrieval similarity score 0-1")

    class Config:
        # Allow extra fields from ml model that we haven't defined
        extra = "allow"
