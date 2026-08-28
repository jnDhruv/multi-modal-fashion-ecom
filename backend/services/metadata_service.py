"""
metadata_service.py — Product Metadata Extraction
====================================================
Extracts and structures product metadata from the raw Product objects.
This is backend's preprocessing step before prompt construction.

Why a separate service?
- Keeps prompt_service.py clean and focused on prompt logic
- Makes it easy to add new metadata fields later
- Centralizes metadata formatting rules
"""

from typing import Dict, Any, Optional
from app.schemas.product import Product


def extract_product_metadata(product: Product) -> Dict[str, Any]:
    """
    Extracts all available metadata from a Product object
    and returns a clean dictionary for use in prompt construction.

    Only includes fields that actually have values (not None).
    This prevents the prompt from saying 'Color: None' which
    would confuse the AI.
    """

    metadata = {}

    # Always include the core fields
    metadata["id"] = product.id
    metadata["title"] = product.title

    # Only include optional fields if they have values
    optional_fields = [
        ("category", "Category"),
        ("color", "Color"),
        ("material", "Material"),
        ("fit", "Fit"),
        ("season", "Season"),
        ("style", "Style"),
        ("gender", "Gender"),
        ("brand", "Brand"),
        ("description", "Description"),
    ]

    for field_name, display_name in optional_fields:
        value = getattr(product, field_name, None)
        if value and str(value).strip():
            metadata[field_name] = value

    # Include price if available
    if product.price is not None:
        metadata["price"] = product.price

    return metadata


def format_metadata_for_prompt(product: Product) -> str:
    """
    Formats product metadata as a readable text block for the prompt.

    Example output:
        Title: Oversized Cotton Hoodie
        Category: Hoodie
        Color: Black
        Material: Cotton
        Fit: Oversized
        Season: Winter

    This formatted text is what Gemini reads to understand the product.
    """

    lines = []

    # Title is always first
    lines.append(f"Title: {product.title}")

    # Optional fields in a logical order
    field_map = [
        ("category", "Category"),
        ("color", "Color"),
        ("material", "Material"),
        ("fit", "Fit"),
        ("season", "Season"),
        ("style", "Style"),
        ("gender", "Gender"),
        ("brand", "Brand"),
    ]

    for field_name, display_name in field_map:
        value = getattr(product, field_name, None)
        if value and str(value).strip():
            lines.append(f"{display_name}: {value}")

    # Price formatted as Indian Rupees
    if product.price is not None:
        lines.append(f"Price: ₹{product.price:,.0f}")

    # Description last (it's longer)
    if product.description and product.description.strip():
        lines.append(f"Description: {product.description}")

    return "\n".join(lines)


def extract_all_products_metadata(products: list) -> list:
    """
    Extracts metadata from a list of Product objects.
    Returns a list of metadata dictionaries.
    """
    return [extract_product_metadata(p) for p in products]


def get_available_attributes(product: Product) -> list:
    """
    Returns a list of attribute names that actually have values.
    Used to tell Gemini which attributes it can reference.

    Example return: ['color', 'material', 'fit', 'season']
    """
    available = []

    check_fields = ["category", "color", "material", "fit", "season", "style", "gender", "brand"]

    for field in check_fields:
        value = getattr(product, field, None)
        if value and str(value).strip():
            available.append(field)

    return available
