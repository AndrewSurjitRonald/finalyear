"""
Explainable AI (XAI) pipeline using SHAP (SHapley Additive exPlanations).
Computes global feature attribution and individual pairwise local force/contribution breakdowns.
"""

import numpy as np
import shap
from typing import Dict, List, Any, Tuple
from ml.feature_engineering import FEATURE_NAMES, FEATURE_LABEL_MAP, FEATURE_CATEGORY_MAP

class SHAPExplainerService:
    def __init__(self, model, background_data: np.ndarray = None):
        self.model = model
        # Background summary for TreeExplainer or exact TreeExplainer
        if background_data is not None and len(background_data) > 100:
            bg = shap.sample(background_data, 100, random_state=42)
            self.explainer = shap.TreeExplainer(model, bg)
        else:
            self.explainer = shap.TreeExplainer(model)
        
        # Safe extraction of base expected value
        exp_val = getattr(self.explainer, "expected_value", 70.0)
        if isinstance(exp_val, (list, tuple, np.ndarray)):
            if len(exp_val) > 0:
                self.base_value = float(exp_val[0])
            else:
                self.base_value = 70.0
        else:
            try:
                self.base_value = float(exp_val)
            except Exception:
                self.base_value = 70.0

    def compute_global_importance(self, X_sample: np.ndarray) -> List[Dict[str, Any]]:
        """Compute mean absolute SHAP feature importance across test/sample set."""
        shap_vals = self.explainer.shap_values(X_sample)
        if isinstance(shap_vals, list):
            shap_vals = shap_vals[0]
        
        mean_abs_shap = np.mean(np.abs(shap_vals), axis=0)
        
        importance_list = []
        for i, fname in enumerate(FEATURE_NAMES):
            score = float(mean_abs_shap[i]) if i < len(mean_abs_shap) else 0.0
            importance_list.append({
                "feature_name": fname,
                "feature_label": FEATURE_LABEL_MAP.get(fname, fname),
                "importance_score": round(score, 4),
                "category": FEATURE_CATEGORY_MAP.get(fname, "General")
            })

        importance_list.sort(key=lambda x: x["importance_score"], reverse=True)
        return importance_list

    def explain_pairwise_recommendation(
        self,
        features_1d: np.ndarray,
        user_a_name: str = "You",
        user_b_name: str = "Candidate"
    ) -> Dict[str, Any]:
        """
        Compute local SHAP attribution for a specific pairwise recommendation.
        Returns base value, predicted score, positive drivers, negative friction points,
        and human-readable synthesis.
        """
        X_input = features_1d.reshape(1, -1)
        shap_vals = self.explainer.shap_values(X_input)
        if isinstance(shap_vals, list):
            shap_vals = shap_vals[0]
        
        shap_row = shap_vals[0]
        predicted_score = float(self.model.predict(X_input)[0])

        contributions = []
        for i, fname in enumerate(FEATURE_NAMES):
            s_val = float(shap_row[i]) if i < len(shap_row) else 0.0
            f_val = float(features_1d[i]) if i < len(features_1d) else 0.0
            direction = "positive" if s_val >= 0 else "negative"
            label = FEATURE_LABEL_MAP.get(fname, fname)
            
            human_text = self._generate_human_explanation(fname, s_val, f_val)
            
            contributions.append({
                "feature_name": fname,
                "feature_label": label,
                "shap_value": round(s_val, 3),
                "feature_value": round(f_val, 3),
                "direction": direction,
                "human_explanation": human_text
            })

        # Separate positive and negative contributors
        positives = [c for c in contributions if c["shap_value"] > 0]
        negatives = [c for c in contributions if c["shap_value"] < 0]

        positives.sort(key=lambda x: x["shap_value"], reverse=True)
        negatives.sort(key=lambda x: x["shap_value"]) # Most negative first

        return {
            "base_value": round(self.base_value, 2),
            "predicted_compatibility": round(predicted_score, 2),
            "top_positive_features": positives[:4],
            "top_negative_features": negatives[:4],
            "all_contributions": contributions
        }

    def _generate_human_explanation(self, feature_name: str, shap_val: float, feature_val: float) -> str:
        """Translates numerical SHAP attribution into context-rich natural language."""
        if shap_val > 0:
            if feature_name == "tech_complementarity":
                return "Strong complementary skill set broadens project technical capability."
            elif feature_name == "tech_jaccard_sim":
                return "Solid shared technical foundation allows efficient code review and communication."
            elif feature_name == "tech_required_coverage":
                return "Jointly covers critical high-priority project skill requirements."
            elif feature_name == "big5_cosine_sim":
                return "Balanced behavioral profiles foster strong psychological safety."
            elif feature_name == "agreeableness_min":
                return "High mutual empathy and constructiveness prevents toxic friction."
            elif feature_name == "emotional_stability_min":
                return "Strong collective composure during high-pressure deadlines and crunch times."
            elif feature_name == "conscientiousness_alignment":
                return "Synchronized high standards for code quality, rigorous testing, and documentation."
            elif feature_name == "workstyle_collab_alignment":
                return "Harmonious balance between pair-programming collaboration and focused autonomy."
            elif feature_name == "comm_async_alignment":
                return "Aligned preference on asynchronous PR reviews and documentation."
            elif feature_name == "leadership_complementarity":
                return "Complementary leadership dynamic: clear initiative with strong collaborative balance."
            elif feature_name == "interest_overlap":
                return "Shared passion for domain vertical elevates long-term project motivation."
            else:
                return f"Positive contribution to team harmony (+{round(shap_val, 2)})."
        else:
            if feature_name == "leadership_complementarity":
                return "Potential leadership friction due to competing dominant decision-making styles."
            elif feature_name == "comm_directness_diff":
                return "Noticeable gap in feedback style (blunt candor vs highly diplomatic phrasing)."
            elif feature_name == "workstyle_structure_diff":
                return "Discrepancy in roadmap adherence vs exploratory agile pivoting."
            elif feature_name == "workstyle_pace_diff":
                return "Differing preferences in rapid MVP iteration speed vs deliberate upfront architecture."
            elif feature_name == "tech_jaccard_sim":
                return "Limited shared technical vocabulary might require onboarding buffer."
            elif feature_name == "conscientiousness_alignment":
                return "Slight variance in documentation rigor and testing expectations."
            else:
                return f"Mild collaboration friction point ({round(shap_val, 2)})."
