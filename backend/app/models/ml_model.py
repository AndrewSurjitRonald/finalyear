from sqlalchemy import Column, Integer, String, Float, Text, DateTime
from datetime import datetime
from app.core.database import Base

class MLModelVersion(Base):
    __tablename__ = "ml_model_versions"

    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String(100), nullable=False) # e.g., "XGBoost_Compatibility_v1"
    version = Column(String(50), nullable=False)
    algorithm = Column(String(100), nullable=False) # XGBoostRegressor, RandomForestRegressor
    is_active = Column(Integer, default=1)
    dataset_size = Column(Integer, default=0)
    features_list_json = Column(Text, nullable=False) # JSON list of feature names
    metrics_json = Column(Text, nullable=False) # JSON with MAE, RMSE, R2, etc.
    baseline_comparison_json = Column(Text, nullable=True) # JSON comparing baseline vs model
    ablation_results_json = Column(Text, nullable=True) # JSON with Model A to E metrics
    trained_at = Column(DateTime, default=datetime.utcnow)
    artifact_path = Column(String(512), nullable=True)
