"""
Utilities for cleaning and canonicalizing the fashion dataset.
"""

from pathlib import Path
import json

import pandas as pd


def load_styles_csv_ids(styles_csv_path: Path) -> set[int]:
    """Load valid product IDs from styles.csv."""
    df = pd.read_csv(styles_csv_path, on_bad_lines="skip")
    return set(df["id"].dropna().astype(int))

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