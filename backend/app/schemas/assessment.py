from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Dict
from datetime import datetime

class QuestionnaireItemOut(BaseModel):
    id: int
    category: str
    dimension: str
    question_text: str
    order_index: int
    reverse_scored: int

    model_config = ConfigDict(from_attributes=True)

class SingleResponseIn(BaseModel):
    item_id: int
    response_value: int  # 1 to 5

class AssessmentSubmission(BaseModel):
    category: str  # 'personality', 'work_style', 'communication'
    responses: List[SingleResponseIn]

class DimensionScoreOut(BaseModel):
    category: str
    dimension: str
    normalized_score: float  # 0.0 to 1.0
    raw_mean: float  # 1.0 to 5.0
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class AssessmentSummaryOut(BaseModel):
    user_id: int
    personality_scores: Dict[str, float]
    work_style_scores: Dict[str, float]
    communication_scores: Dict[str, float]
    is_complete: bool
