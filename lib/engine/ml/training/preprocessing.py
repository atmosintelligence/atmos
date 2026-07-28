"""
Data preprocessing pipeline.

Responsibilities
----------------
- Missing value imputation
- Outlier clipping
- Timestamp feature extraction
- Feature normalization
- Sliding window generation

Author:
Building Intelligence Lab

Pipeline Version:
v3.1
"""

from sklearn.preprocessing import StandardScaler
import pandas as pd
import numpy as np


class DataPreprocessor:

    def __init__(self):
        self.scaler = StandardScaler()

    def clean(self, df: pd.DataFrame):

        df = df.copy()

        numeric = [
            "temperature",
            "humidity",
            "power",
            "voltage",
            "light"
        ]

        for col in numeric:
            if col in df:
                df[col] = df[col].interpolate()

        return df

    def engineer_features(self, df):

        df = df.copy()

        df["hour"] = pd.to_datetime(df.timestamp).dt.hour
        df["weekday"] = pd.to_datetime(df.timestamp).dt.dayofweek

        df["rolling_power"] = (
            df.power
            .rolling(6)
            .mean()
            .fillna(df.power)
        )

        return df

    def normalize(self, X):

        return self.scaler.fit_transform(X)