"""
ML Models architecture: Gradient Boosting Regressor (Primary), Random Forest Regressor,
and XGBoost (when environment supports OpenMP), along with Baseline and Ablation definitions.
"""

import numpy as np
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from typing import Dict, Any, Tuple, List

# Check if XGBoost is importable without system OpenMP runtime crash
HAS_XGBOOST = False
try:
    import xgboost as xgb
    # Test instantiating a dummy model to check if libomp is loaded
    _dummy = xgb.XGBRegressor(n_estimators=1)
    HAS_XGBOOST = True
except Exception:
    HAS_XGBOOST = False

def get_compatibility_model(algorithm: str = "gradient_boosting"):
    """
    Instantiate primary Gradient Boosting, Random Forest, or XGBoost model.
    Defaults to GradientBoostingRegressor for 100% native cross-platform stability.
    """
    if algorithm == "xgboost" and HAS_XGBOOST:
        return xgb.XGBRegressor(
            n_estimators=150,
            learning_rate=0.08,
            max_depth=4,
            subsample=0.85,
            colsample_bytree=0.85,
            random_state=42
        )
    elif algorithm == "random_forest":
        return RandomForestRegressor(
            n_estimators=150,
            max_depth=8,
            random_state=42,
            n_jobs=-1
        )
    else:
        # High performance Gradient Boosting Regressor (compatible with TreeExplainer)
        return GradientBoostingRegressor(
            n_estimators=150,
            learning_rate=0.08,
            max_depth=4,
            subsample=0.85,
            random_state=42
        )

def evaluate_regression(y_true: np.ndarray, y_pred: np.ndarray) -> Dict[str, float]:
    """Calculate true regression metrics: MAE, RMSE, R2."""
    mae = float(mean_absolute_error(y_true, y_pred))
    mse = float(mean_squared_error(y_true, y_pred))
    rmse = float(np.sqrt(mse))
    r2 = float(r2_score(y_true, y_pred))
    return {
        "mae": round(mae, 4),
        "rmse": round(rmse, 4),
        "r2_score": round(r2, 4)
    }

def train_and_evaluate_baseline(
    X_train: np.ndarray,
    y_train: np.ndarray,
    X_test: np.ndarray,
    y_test: np.ndarray
) -> Dict[str, Any]:
    """
    Trains a baseline model using only technical skill features (first 4 features:
    tech_jaccard_sim, tech_complementarity, tech_required_coverage, tech_proficiency_avg).
    """
    X_train_base = X_train[:, :4]
    X_test_base = X_test[:, :4]

    baseline_model = RandomForestRegressor(n_estimators=100, max_depth=6, random_state=42)
    baseline_model.fit(X_train_base, y_train)
    y_pred = baseline_model.predict(X_test_base)

    metrics = evaluate_regression(y_test, y_pred)
    return {
        "model_name": "Baseline (Skills Only)",
        "description": "Compatibility evaluated strictly through technical skill overlap and proficiency",
        "features_used": 4,
        **metrics
    }

def run_ablation_study(
    X_train: np.ndarray,
    y_train: np.ndarray,
    X_test: np.ndarray,
    y_test: np.ndarray
) -> List[Dict[str, Any]]:
    """
    Executes a structured 5-stage ablation study evaluating the progressive predictive gain
    of each psychometric and behavioral feature layer.
    """
    stages = [
        ("Model A (Skills Only)", 4, "Technical Skills"),
        ("Model B (+ Personality)", 9, "Skills + Big Five"),
        ("Model C (+ Work Style)", 12, "Skills + Big 5 + Work Style"),
        ("Model D (+ Communication)", 15, "Skills + Big 5 + Work Style + Communication"),
        ("Model E (Full CoFound AI Model)", 17, "Full Multi-dimensional Feature Set")
    ]

    ablation_results = []

    for stage_name, num_feats, subset_desc in stages:
        X_tr = X_train[:, :num_feats]
        X_te = X_test[:, :num_feats]

        model = GradientBoostingRegressor(n_estimators=100, max_depth=4, learning_rate=0.08, random_state=42)
        model.fit(X_tr, y_train)
        y_pred = model.predict(X_te)
        metrics = evaluate_regression(y_test, y_pred)

        ablation_results.append({
            "stage_name": stage_name,
            "feature_subset": subset_desc,
            "features_count": num_feats,
            **metrics
        })

    return ablation_results
