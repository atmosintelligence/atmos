"""
Ensemble Meta Model

Combines

- Energy Predictor
- Comfort Classifier
- Isolation Forest

Voting strategy:
Weighted Soft Voting
"""

from energy_predictor import EnergyPredictor
from anomaly_detector import AnomalyDetector
from comfort_classifier import ComfortClassifier


class SmartBuildingAI:

    def __init__(self):

        self.energy = EnergyPredictor()
        self.anomaly = AnomalyDetector()
        self.comfort = ComfortClassifier()

    def infer(self, sample):

        prediction = self.energy.predict(sample)

        anomaly = self.anomaly.detect(sample)

        comfort = self.comfort.predict(
            sample[0],
            sample[1]
        )

        return {
            "energy_prediction": prediction,
            "comfort": comfort,
            "anomaly": anomaly
        }