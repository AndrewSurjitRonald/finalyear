from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime

class ProjectRequirementIn(BaseModel):
    skill_name: str
    min_proficiency: float = 3.0  # 1.0 to 5.0
    importance_weight: float = 1.0  # 0.5 to 2.0
    role_name: Optional[str] = None

class ProjectRequirementOut(BaseModel):
    id: int
    skill_name: str
    min_proficiency: float
    importance_weight: float
    role_name: Optional[str]

    model_config = ConfigDict(from_attributes=True)

class ProjectCreate(BaseModel):
    title: str
    description: str
    project_type: str = "Startup"  # Startup, Hackathon, College Project, Research, Open Source
    target_team_size: int = 4
    duration_weeks: int = 8
    domain_category: str = "AI/ML"
    experience_level_required: str = "Intermediate"
    requirements: List[ProjectRequirementIn]

class ProjectOut(BaseModel):
    id: int
    title: str
    description: str
    project_type: str
    target_team_size: int
    duration_weeks: int
    domain_category: str
    experience_level_required: str
    creator_id: int
    created_at: datetime
    requirements: List[ProjectRequirementOut] = []

    model_config = ConfigDict(from_attributes=True)
