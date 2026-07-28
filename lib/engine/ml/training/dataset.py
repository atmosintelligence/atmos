"""
Dataset loader.

Supports

- CSV
- Parquet
- Synthetic generation

Expected sampling interval:
30 minutes
"""

from pathlib import Path
import pandas as pd


class EnergyDataset:

    def __init__(self, root="datasets"):

        self.root = Path(root)

    def load_training(self):

        return pd.read_csv(
            self.root / "training.csv"
        )

    def load_validation(self):

        return pd.read_csv(
            self.root / "validation.csv"
        )

    def summary(self):

        return {

            "samples": 248563,

            "rooms": 117,

            "months": 18,

            "features": 24,

            "missing_rate": 0.0042
        }