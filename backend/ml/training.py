"""
Reproducible ML Training, Evaluation, Ablation, and Serialization Pipeline.
"""

import os
import joblib
import json
import numpy as np
from datetime import datetime
from typing import Dict, Any, Tuple
from sklearn.model_selection import train_test_split

from app.core.config import settings
from ml.data_generator import generate_pairwise_dataset
from ml.models import (
    get_compatibility_model,
    evaluate_regression,
    train_and_evaluate_baseline,
    run_ablation_study,
    HAS_XGBOOST
)
from ml.explainability import SHAPExplainerService
from ml.feature_engineering import FEATURE_NAMES

MODEL_FILENAME = os.path.join(settings.ML_MODEL_DIR, "cofound_compatibility_model.joblib")
METADATA_FILENAME = os.path.join(settings.ML_MODEL_DIR, "model_metadata.json")

def run_full_training_pipeline(
    num_users: int = 100,
    num_pairs: int = 3000,
    algorithm: str = "gradient_boosting"
) -> Dict[str, Any]:
    """
    Executes the end-to-end ML training pipeline:
    1. Synthetic Pairwise Dataset Generation (Realistic collaborative features & ground truth)
    2. Train / Val / Test Split (70% train, 15% val, 15% test)
    3. Model Training (Gradient Boosting Regressor / XGBoost)
    4. Baseline Model Comparison (Technical skills only)
    5. Structured Ablation Study (5 progressive stages)
    6. SHAP TreeExplainer & Global Feature Importance
    7. Artifact Serialization
    """
    print(f"[*] Generating synthetic pairwise collaboration dataset ({num_users} users, {num_pairs} pairs)...")
    X, y, synthetic_users = generate_pairwise_dataset(num_users=num_users, num_pairs=num_pairs, seed=42)

    X_train, X_temp, y_train, y_temp = train_test_split(X, y, test_size=0.30, random_state=42)
    X_val, X_test, y_val, y_test = train_test_split(X_temp, y_temp, test_size=0.50, random_state=42)

    selected_algo = algorithm if (algorithm != "xgboost" or HAS_XGBOOST) else "gradient_boosting"
    print(f"[*] Training {selected_algo.upper()} compatibility model...")
    model = get_compatibility_model(algorithm=selected_algo)
    model.fit(X_train, y_train)

    # Test set evaluation
    y_pred = model.predict(X_test)
    test_metrics = evaluate_regression(y_test, y_pred)
    print(f"[*] Model Test Metrics: MAE={test_metrics['mae']}, RMSE={test_metrics['rmse']}, R2={test_metrics['r2_score']}")

    # Baseline Model (Skills only)
    print("[*] Training and evaluating Baseline (Skills-Only) model...")
    baseline_res = train_and_evaluate_baseline(X_train, y_train, X_test, y_test)

    # Ablation Study
    print("[*] Executing 5-Stage Ablation Study...")
    ablation_res = run_ablation_study(X_train, y_train, X_test, y_test)

    # SHAP Explainability Service
    print("[*] Initializing SHAP TreeExplainer and extracting global feature importance...")
    shap_service = SHAPExplainerService(model=model, background_data=X_train)
    global_importance = shap_service.compute_global_importance(X_test)

    metadata = {
        "model_name": "CoFound_MultiDimensional_Compatibility_Model",
        "version": "v1.2.0",
        "algorithm": selected_algo,
        "trained_at": datetime.utcnow().isoformat(),
        "dataset_samples": len(X),
        "features_count": len(FEATURE_NAMES),
        "features_list": FEATURE_NAMES,
        "test_metrics": test_metrics,
        "baseline_comparison": [
            {
                "model_name": baseline_res["model_name"],
                "description": baseline_res["description"],
                "mae": baseline_res["mae"],
                "rmse": baseline_res["rmse"],
                "r2_score": baseline_res["r2_score"]
            },
            {
                "model_name": "CoFound AI (Full Model)",
                "description": "Multi-dimensional framework (Technical + Big Five + Work Style + Communication + Leadership + Interests)",
                "mae": test_metrics["mae"],
                "rmse": test_metrics["rmse"],
                "r2_score": test_metrics["r2_score"]
            }
        ],
        "ablation_study": ablation_res,
        "global_feature_importance": global_importance,
        "synthetic_users_count": len(synthetic_users)
    }

    # Save artifacts
    print(f"[*] Saving model artifact to {MODEL_FILENAME}...")
    joblib.dump(model, MODEL_FILENAME)

    with open(METADATA_FILENAME, "w") as f:
        json.dump(metadata, f, indent=2)

    print("[+] Training pipeline completed successfully!")
    return metadata

class MLInferenceEngine:
    _instance = None

    def __init__(self):
        self.model = None
        self.metadata = None
        self.shap_service = None
        self.load_or_train()

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = MLInferenceEngine()
        return cls._instance

    def load_or_train(self):
        """Loads trained model from disk or trains immediately if not present."""
        if os.path.exists(MODEL_FILENAME) and os.path.exists(METADATA_FILENAME):
            try:
                self.model = joblib.load(MODEL_FILENAME)
                with open(METADATA_FILENAME, "r") as f:
                    self.metadata = json.load(f)
                self.shap_service = SHAPExplainerService(self.model)
                return
            except Exception as e:
                print(f"[!] Error loading model artifact: {e}, retraining...")

        # Train model
        self.metadata = run_full_training_pipeline()
        self.model = joblib.load(MODEL_FILENAME)
        self.shap_service = SHAPExplainerService(self.model)

    def predict_compatibility(self, features_1d: np.ndarray) -> float:
        """Predict compatibility percentage score (0 to 100)."""
        if self.model is None:
            self.load_or_train()
        pred = float(self.model.predict(features_1d.reshape(1, -1))[0])
        return round(float(np.clip(pred, 15.0, 99.0)), 2)

    def explain_prediction(self, features_1d: np.ndarray, user_a_name: str, user_b_name: str):
        """Generate local SHAP explanation."""
        if self.shap_service is None:
            self.load_or_train()
        return self.shap_service.explain_pairwise_recommendation(features_1d, user_a_name, user_b_name)
