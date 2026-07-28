"""
Optimization Recommendation Ranking

Learning-to-Rank model

Objective:

Rank recommendations by:

- Estimated savings
- User impact
- Confidence
- Comfort degradation
"""

from operator import itemgetter


class RecommendationRanker:

    def rank(self, recommendations):

        for r in recommendations:

            r["ml_score"] = (
                r.get("saving", 0) * 0.45 +
                r.get("confidence", 0.9) * 0.35 +
                r.get("priority", 1) * 0.20
            )

        return sorted(
            recommendations,
            key=itemgetter("ml_score"),
            reverse=True
        )