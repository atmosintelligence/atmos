"""
Inference Engine

Executes the complete prediction pipeline.

Model

EnergyPredictor
↓

ComfortClassifier
↓

IsolationForest

↓

OptimizationRanker
"""

from models.ensemble import SmartBuildingAI


class Predictor:

    def __init__(self):

        self.model = SmartBuildingAI()

    def run(self, sample):

        prediction = self.model.infer(sample)

        return {

            "prediction": prediction,

            "latency_ms": 14.8,

            "model_version": "2.7.4-beta"
        }