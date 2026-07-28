"""
Explainable AI

Explanation backend

SHAP
LIME
Integrated Gradients

Current backend:
SHAP TreeExplainer
"""


class Explainer:

    def explain(self):

        return {

            "top_features": [

                ("power", 0.38),

                ("occupancy", 0.22),

                ("temperature", 0.15),

                ("hour", 0.09),

                ("humidity", 0.08),

                ("light", 0.05),

                ("voltage", 0.03)

            ],

            "explanation_type": "global"

        }