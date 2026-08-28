"""
gemini_service.py — Gemini API Integration
============================================
This is the service that actually calls the Gemini API.
All Gemini interactions go through this file.

KEY SECURITY RULE:
The GEMINI_API_KEY is only read here, server-side.
It is NEVER sent to the React frontend.
React → FastAPI → Gemini (key stays on server)

Flow:
1. Receive a prompt string
2. Send it to Gemini
3. Parse the JSON response
4. Return structured data
5. Handle all errors gracefully
"""

import json
import re
import logging
from typing import List, Dict, Optional

import google.generativeai as genai

from app.config.settings import settings
from app.schemas.product import Product
from app.services.prompt_service import (
    SYSTEM_INSTRUCTION,
    build_batch_prompt,
    build_single_product_prompt,
    build_fallback_note
)

# Set up logging
logger = logging.getLogger(__name__)


def initialize_gemini():
    """
    Initialize the Gemini client with the API key.
    Called once when the service is first used.
    """
    if not settings.GEMINI_API_KEY:
        logger.warning("GEMINI_API_KEY is not set. Gemini calls will fail.")
        return None

    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel(
            model_name=settings.GEMINI_MODEL,
            system_instruction=SYSTEM_INSTRUCTION,
            generation_config=genai.GenerationConfig(
                temperature=0.3,        # Lower = more factual, less creative
                max_output_tokens=2048, # Enough for 10-12 products
                top_p=0.8,
            )
        )
        logger.info(f"Gemini initialized with model: {settings.GEMINI_MODEL}")
        return model
    except Exception as e:
        logger.error(f"Failed to initialize Gemini: {e}")
        return None


def extract_json_from_response(text: str) -> Optional[dict]:
    """
    Parses Gemini's response text to extract valid JSON.
    Handles cases where Gemini might wrap JSON in markdown code blocks.

    Tries multiple parsing strategies:
    1. Direct JSON parsing
    2. Strip markdown code blocks, then parse
    3. Regex extraction of JSON object
    """

    if not text:
        return None

    # Strategy 1: Try direct parsing first
    try:
        return json.loads(text.strip())
    except json.JSONDecodeError:
        pass

    # Strategy 2: Strip markdown code blocks (```json ... ```)
    clean_text = re.sub(r'```(?:json)?\s*', '', text)
    clean_text = re.sub(r'```\s*$', '', clean_text).strip()

    try:
        return json.loads(clean_text)
    except json.JSONDecodeError:
        pass

    # Strategy 3: Find JSON object using regex
    json_match = re.search(r'\{[\s\S]*\}', text)
    if json_match:
        try:
            return json.loads(json_match.group())
        except json.JSONDecodeError:
            pass

    logger.warning(f"Could not parse JSON from Gemini response: {text[:200]}...")
    return None


def generate_style_notes_batch(
    user_query: str,
    products: List[Product]
) -> Dict[int, str]:
    """
    Generate style notes for ALL products in a single Gemini API call.
    This is the preferred method — efficient and fast.

    Returns a dictionary mapping product_id → style_note string.
    Example: {102: "This hoodie matches...", 205: "This jacket suits..."}
    """

    # Initialize Gemini
    model = initialize_gemini()

    if not model:
        logger.warning("Gemini not available. Returning fallback notes.")
        return {
            product.id: build_fallback_note(user_query, product)
            for product in products
        }

    # Build the batch prompt
    prompt = build_batch_prompt(user_query, products)

    try:
        logger.info(f"Sending batch prompt to Gemini for {len(products)} products...")

        # Call Gemini API
        response = model.generate_content(prompt)

        # Get the response text
        response_text = response.text

        logger.info("Gemini responded successfully.")
        logger.debug(f"Raw Gemini response: {response_text[:500]}...")

        # Parse the JSON response
        parsed = extract_json_from_response(response_text)

        if not parsed or "products" not in parsed:
            logger.warning("Gemini response missing 'products' key. Falling back.")
            return _generate_individual_notes(user_query, products, model)

        # Build the result dictionary: {product_id: style_note}
        result = {}
        for item in parsed["products"]:
            try:
                product_id = int(item.get("id", 0))
                style_note = str(item.get("style_note", "")).strip()

                if product_id and style_note:
                    result[product_id] = style_note
            except (ValueError, TypeError) as e:
                logger.warning(f"Could not parse product item from Gemini: {item} — {e}")

        # Check if we got notes for all products
        missing_ids = [p.id for p in products if p.id not in result]
        if missing_ids:
            logger.warning(f"Missing style notes for product IDs: {missing_ids}")
            # Fill in fallback notes for missing ones
            for product in products:
                if product.id not in result:
                    result[product.id] = build_fallback_note(user_query, product)

        logger.info(f"Generated {len(result)} style notes successfully.")
        return result

    except Exception as e:
        logger.error(f"Gemini batch call failed: {e}")
        # Try individual calls as fallback
        return _generate_individual_notes(user_query, products, model)


def _generate_individual_notes(
    user_query: str,
    products: List[Product],
    model
) -> Dict[int, str]:
    """
    Fallback: Generate style notes one product at a time.
    Used when the batch call fails or returns incomplete data.
    Slower but more reliable.
    """

    logger.info("Falling back to individual product style note generation...")
    result = {}

    for product in products:
        try:
            prompt = build_single_product_prompt(user_query, product)
            response = model.generate_content(prompt)
            parsed = extract_json_from_response(response.text)

            if parsed and "style_note" in parsed:
                result[product.id] = str(parsed["style_note"]).strip()
            else:
                result[product.id] = build_fallback_note(user_query, product)

        except Exception as e:
            logger.error(f"Individual Gemini call failed for product {product.id}: {e}")
            result[product.id] = build_fallback_note(user_query, product)

    return result


def is_gemini_configured() -> bool:
    """Check if the Gemini API key is configured."""
    return bool(settings.GEMINI_API_KEY and settings.GEMINI_API_KEY.strip())
