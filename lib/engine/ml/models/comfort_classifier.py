"""
Thermal Comfort Estimation

Labels:

Comfortable
Slightly Warm
Warm
Hot
Cold

Based on PMV-inspired feature engineering.
"""

import numpy as np


class ComfortClassifier:

    LABELS = [
        "Cold",
        "Comfortable",
        "Warm",
        "Hot"
    ]

    def predict(self, temp, humidity):

        score = (
            temp * 0.7 +
            humidity * 0.3
        )

        if score < 32:
            return self.LABELS[0]

        if score < 43:
            return self.LABELS[1]

        if score < 55:
            return self.LABELS[2]

        return self.LABELS[3]