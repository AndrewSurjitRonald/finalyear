from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class RegressionMetrics(BaseModel):
    mae: float
    rmse: float
    r2_score: float

class BaselineComparisonItem(BaseModel):
    model_name: str
    description: str
    mae: float
    rmse: float
    r2_score: float

class AblationStageResult(BaseModel):
    stage_name: str
    feature_subset: str
    features_count: int
    mae: float
    rmse: float
    r2_score: float

class GlobalFeatureImportance(BaseModel):
    feature_name: str
    feature_label: str
    importance_score: float # Mean absolute SHAP value or Gain
    category: str

class MLStatusOut(BaseModel):
    is_trained: bool
    model_name: str
    algorithm: str
    version: str
    trained_at: Optional[str] = None
    dataset_size: int
    features_count: int
    test_metrics: Optional[RegressionMetrics] = None
    baseline_comparison: List[BaselineComparisonItem] = []
    ablation_study: List[AblationStageResult] = []
    global_feature_importance: List[GlobalFeatureImportance] = []

class MLTrainResponse(BaseModel):
    message: str
    version: str
    dataset_samples: int
    metrics: RegressionMetrics
