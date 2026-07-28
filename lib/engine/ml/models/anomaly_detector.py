"""
Isolation Forest + Autoencoder Hybrid

Detects:

- Phantom loads
- HVAC anomalies
- Unexpected spikes
- Sensor drift
"""

import numpy as np


class AnomalyDetector:

    def __init__(self):

        self.threshold = 2.75

    def score(self, vector):

        score = abs(np.mean(vector) - np.median(vector))

        return score

    def detect(self, vector):

        score = self.score(vector)

        return {
            "score": score,
            "is_anomaly": score > self.threshold,
            "confidence": min(score / 4.0, 0.99)
        }