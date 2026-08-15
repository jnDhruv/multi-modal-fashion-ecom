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