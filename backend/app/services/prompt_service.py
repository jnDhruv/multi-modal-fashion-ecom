"""
prompt_service.py — Prompt Engineering
=========================================
Builds the prompts that are sent to Gemini.
This is one of the most important parts of backend's module.

Key principles:
1. Only use information from the product metadata — NO hallucination
2. Keep instructions clear and specific
3. Request structured JSON output for reliable parsing
4. Handle both single and batch product prompts
"""

from typing import List
from app.schemas.product import Product
from app.services.metadata_service import format_metadata_for_prompt


# ─── System Instruction ──────────────────────────────────────────────────────
# This tells Gemini what role it's playing and what rules to follow

SYSTEM_INSTRUCTION = """You are an AI fashion stylist assistant for a fashion e-commerce platform.

Your task is to explain why each retrieved product matches the user's search request.

STRICT RULES — you MUST follow these:
1. Only reference product attributes that are explicitly provided in the product metadata.
2. Do NOT invent or assume any product features not listed.
3. Do NOT mention features like "thermal insulation", "breathability", or "durability" unless they are explicitly stated in the metadata.
4. Keep each explanation concise — 1 to 3 sentences maximum.
5. Write in a natural, friendly, and helpful tone — like a knowledgeable fashion advisor.
6. Focus on attributes that directly relate to the user's search query.
7. Always return valid JSON matching the requested format.
8. If a product has very limited metadata, explain only what IS known.

You MUST return ONLY a valid JSON object — no extra text, no markdown code blocks, just the raw JSON."""


def build_batch_prompt(user_query: str, products: List[Product]) -> str:
    """
    Builds a single batch prompt for ALL products together.
    This is more efficient than making separate API calls for each product.

    Gemini receives:
    - The user's original search query
    - Metadata for all retrieved products
    - Instructions to generate an explanation for each

    Returns a structured JSON with one style note per product ID.
    """

    # Format each product's metadata as a labeled block
    product_blocks = []
    for i, product in enumerate(products, 1):
        metadata_text = format_metadata_for_prompt(product)
        product_block = f"""PRODUCT {i} (ID: {product.id}):
{metadata_text}"""
        product_blocks.append(product_block)

    products_section = "\n\n".join(product_blocks)

    # Build the list of expected IDs for the response
    expected_ids = [str(p.id) for p in products]
    ids_list = ", ".join(expected_ids)

    # Build the complete prompt
    prompt = f"""USER'S SEARCH QUERY: "{user_query}"

The following products were retrieved as relevant matches for this query.
For each product, write a concise explanation of why it matches the user's request.
Base your explanation ONLY on the provided product attributes.

{products_section}

TASK:
Generate one style note for each product explaining why it matches the user's query.
Reference specific product attributes (color, material, fit, season, style, etc.) when relevant.
Do NOT invent features not listed in the metadata.

REQUIRED JSON FORMAT (return ONLY this JSON, nothing else):
{{
  "products": [
    {{
      "id": <product_id_as_integer>,
      "style_note": "<explanation_string>"
    }}
  ]
}}

Generate style notes for products with IDs: {ids_list}"""

    return prompt


def build_single_product_prompt(user_query: str, product: Product) -> str:
    """
    Builds a prompt for a single product.
    Used as fallback when batch processing fails.
    """

    metadata_text = format_metadata_for_prompt(product)

    prompt = f"""USER'S SEARCH QUERY: "{user_query}"

RETRIEVED PRODUCT (ID: {product.id}):
{metadata_text}

TASK:
Write a concise explanation (1-3 sentences) of why this product matches the user's search query.
Reference only the provided product attributes — do NOT invent features.

REQUIRED JSON FORMAT (return ONLY this JSON, nothing else):
{{
  "id": {product.id},
  "style_note": "<your_explanation_here>"
}}"""

    return prompt


def build_fallback_note(user_query: str, product: Product) -> str:
    parts = []

    if product.article_type:
        parts.append(f"This {product.article_type.lower()}")
    else:
        parts.append("This item")

    attributes = []
    if product.base_colour:
        attributes.append(f"its {product.base_colour.lower()} color")
    if product.fit:
        attributes.append(f"{product.fit.lower()} fit")
    if product.fabric:
        attributes.append(f"{product.fabric.lower()} material")
    if product.season:
        attributes.append(f"suitability for {product.season.lower()}")

    if attributes:
        parts.append("was retrieved based on " + ", ".join(attributes))
    else:
        parts.append("was retrieved as a relevant match")

    parts.append("for your search.")
    return " ".join(parts)
