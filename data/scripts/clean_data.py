"""
Utilities for cleaning and canonicalizing the fashion dataset.
"""

from pathlib import Path
import json
import re

import pandas as pd
import ftfy
from bs4 import BeautifulSoup


# ------------------
# Config
# ------------------

MISSING_ATTRIBUTE_VALUES = {
    "",
    "NA",
    "N/A",
    "NULL",
    "NONE",
    "NOT APPLICABLE",
    "NOT_AVAILABLE",
}

OPTIONAL_ATTRIBUTES = {
    "pattern": "Pattern",
    "fabric": "Fabric",
    "sleeve_length": "Sleeve Length",
    "occasion": "Occasion",
    "fit": "Fit",
    "neck": "Neck",
    "length": "Length",
}

DESCRIPTION_MAX_CHARS = 1500


# ------------------
# 1. Load
# ------------------

def load_styles_csv_ids(styles_csv_path: Path) -> set[int]:
    """Load valid product IDs from styles.csv."""
    
    df = pd.read_csv(
        styles_csv_path,
        on_bad_lines="skip"
    )
    
    return set(
        df["id"]
        .dropna()
        .astype(int)
    )


def load_json_records(styles_dir: Path) -> list[dict]:
    """Load all valid JSON files from the styles directory."""
    
    records = []
    
    for path in styles_dir.glob("*.json"):
        try:
            with open(path, "r", encoding="utf-8") as f:
                records.append(json.load(f))
        
        except json.JSONDecodeError:
            continue
    
    return records


# ------------------
# 2. Filter
# ------------------

def filter_valid_records(
    json_records: list[dict],
    valid_ids: set[int]
) -> list[dict]:
    """Keep only JSON records whose product ID exists in styles.csv."""
    
    return [
        record
        for record in json_records
        if record.get("data", {}).get("id") in valid_ids
    ]


# ------------------
# 3. Field helpers
# ------------------

def extract_type_name(value):
    """
    Extract typeName from Myntra's nested category objects.
    
    Example:
        {"id": 90, "typeName": "Tshirts"} -> "Tshirts"
    """
    
    if isinstance(value, dict):
        return value.get("typeName")
    
    return value


def is_missing_attribute(value) -> bool:
    """
    Return True if an article attribute represents a missing value.
    """
    
    if value is None:
        return True
    
    normalized = str(value).strip().upper()
    
    return normalized in MISSING_ATTRIBUTE_VALUES


def unwrap_descriptor(
    descriptors: dict,
    key: str
) -> str | None:
    """
    Extract the actual text value from a productDescriptors field.
    
    Myntra stores descriptor fields like:
        {
            "descriptorType": "description",
            "value": "<p>...</p>"
        }
    """
    
    if not isinstance(descriptors, dict):
        return None
    
    value = descriptors.get(key)
    
    if isinstance(value, dict):
        value = value.get("value")
    
    if isinstance(value, str) and value.strip():
        return value
    
    return None


def fix_encoding(text: str) -> str:
    """Fix common Unicode/encoding corruption using ftfy."""
    
    return ftfy.fix_text(text)


def strip_html(text: str) -> str:
    """
    Convert HTML to plain text and normalize whitespace.
    """
    
    plain = BeautifulSoup(
        text,
        "html.parser"
    ).get_text(separator=" ")
    
    return re.sub(
        r"\s+",
        " ",
        plain
    ).strip()


def truncate_text(
    text: str,
    max_chars: int = DESCRIPTION_MAX_CHARS
) -> str:
    """
    Truncate text at a word boundary if it exceeds max_chars.
    """
    
    if len(text) <= max_chars:
        return text
    
    cutoff = text.rfind(" ", 0, max_chars)
    
    if cutoff == -1:
        cutoff = max_chars
    
    return text[:cutoff].strip()


def clean_description(
    raw: str | None
) -> str | None:
    """
    Clean a product description.
    
    Order:
        encoding fix
        -> HTML stripping
        -> whitespace normalization
        -> truncation
    """
    
    if raw is None:
        return None
    
    text = fix_encoding(raw)
    text = strip_html(text)
    text = truncate_text(text)
    
    return text if text else None