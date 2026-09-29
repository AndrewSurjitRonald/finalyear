from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.core.database import get_db
from app.schemas.ml import MLStatusOut, MLTrainResponse, RegressionMetrics
from ml.training import MLInferenceEngine, run_full_training_pipeline

router = APIRouter()

@router.get("/status", response_model=MLStatusOut)
def get_ml_status():
    """Retrieve active model architecture metadata, evaluation metrics, baseline comparison, and ablation results."""
    inference_engine = MLInferenceEngine.get_instance()
    meta = inference_engine.metadata

    if not meta:
        return MLStatusOut(
            is_trained=False,
            model_name="Not Initialized",
            algorithm="Unknown",
            version="0.0.0",
            dataset_size=0,
            features_count=0
        )

    return MLStatusOut(
        is_trained=True,
        model_name=meta.get("model_name", "CoFound Compatibility Regressor"),
        algorithm=meta.get("algorithm", "xgboost"),
        version=meta.get("version", "v1.2.0"),
        trained_at=meta.get("trained_at"),
        dataset_size=meta.get("dataset_samples", 0),
        features_count=meta.get("features_count", 0),
        test_metrics=RegressionMetrics(**meta.get("test_metrics", {"mae": 0.0, "rmse": 0.0, "r2_score": 0.0})),
        baseline_comparison=meta.get("baseline_comparison", []),
        ablation_study=meta.get("ablation_study", []),
        global_feature_importance=meta.get("global_feature_importance", [])
    )

@router.post("/train", response_model=MLTrainResponse)
def trigger_model_retraining():
    """Executes the full training, evaluation, ablation, and SHAP pipeline."""
    meta = run_full_training_pipeline(num_users=100, num_pairs=3000, algorithm="xgboost")
    
    # Reload engine singleton
    engine = MLInferenceEngine.get_instance()
    engine.load_or_train()

    test_metrics = meta["test_metrics"]
    return MLTrainResponse(
        message="Model retraining and ablation evaluation completed successfully.",
        version=meta["version"],
        dataset_samples=meta["dataset_samples"],
        metrics=RegressionMetrics(
            mae=test_metrics["mae"],
            rmse=test_metrics["rmse"],
            r2_score=test_metrics["r2_score"]
        )
    )
