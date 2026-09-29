from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class FeatureContribution(BaseModel):
    feature_name: str
    feature_label: str
    shap_value: float
    feature_value: float
    direction: str # "positive" or "negative"
    human_explanation: str

class SHAPExplanationOut(BaseModel):
    source_user_id: int
    candidate_user_id: int
    base_value: float
    predicted_compatibility: float
    top_positive_features: List[FeatureContribution]
    top_negative_features: List[FeatureContribution]
    all_contributions: List[FeatureContribution]

class TeammateRecommendationOut(BaseModel):
    user_id: int
    full_name: str
    profession: str
    experience_level: str
    avatar_url: Optional[str] = None
    overall_compatibility: float  # 0 to 100
    technical_score: float
    personality_score: float
    work_style_score: float
    communication_score: float
    leadership_score: float
    interest_score: float
    conflict_risk: str  # Low, Medium, High
    conflict_risk_score: float # 0 to 100
    shared_skills: List[str]
    complementary_skills: List[str]
    recommended_role: str
    role_reasoning: str
    explanation_highlights: List[str]
    shap_summary: Optional[SHAPExplanationOut] = None

class TeamGenerateRequest(BaseModel):
    project_id: int
    team_size: Optional[int] = None
    focus_preference: Optional[str] = "balanced" # "balanced", "high_skill", "high_chemistry"

class TeamMemberOut(BaseModel):
    user_id: int
    full_name: str
    profession: str
    assigned_role: str
    role_suitability_score: float
    role_reasoning: str
    skills: List[str]
    avatar_url: Optional[str] = None

class TeamOut(BaseModel):
    id: Optional[int] = None
    project_id: int
    name: str
    team_chemistry_score: float
    skill_coverage_score: float
    personality_balance_score: float
    work_style_balance_score: float
    communication_balance_score: float
    leadership_balance_score: float
    conflict_risk_score: float
    conflict_risk_level: str
    members: List[TeamMemberOut]
    strengths: List[str]
    risks: List[str]
