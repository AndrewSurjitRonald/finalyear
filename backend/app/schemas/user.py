from pydantic import BaseModel, EmailStr, ConfigDict
from typing import List, Optional
from datetime import datetime

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    email: str

class TokenPayload(BaseModel):
    sub: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    profession: Optional[str] = "Software Engineer"
    education: Optional[str] = "Computer Science"

class SkillBase(BaseModel):
    name: str
    category: Optional[str] = "Technical"

class SkillOut(SkillBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class UserSkillAdd(BaseModel):
    skill_name: str
    proficiency: float = 3.0  # 1.0 to 5.0
    years_experience: float = 1.0

class UserSkillOut(BaseModel):
    id: int
    skill_id: int
    name: str
    category: str
    proficiency: float
    years_experience: float

class InterestAdd(BaseModel):
    interest_tag: str
    category: Optional[str] = "General"

class InterestOut(BaseModel):
    id: int
    interest_tag: str
    category: str
    model_config = ConfigDict(from_attributes=True)

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    education: Optional[str] = None
    profession: Optional[str] = None
    experience_years: Optional[float] = None
    experience_level: Optional[str] = None
    weekly_hours_available: Optional[int] = None
    leadership_tendency: Optional[float] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None

class ProfileOut(BaseModel):
    id: int
    user_id: int
    full_name: str
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    education: Optional[str] = None
    profession: Optional[str] = None
    experience_years: float
    experience_level: str
    weekly_hours_available: int
    leadership_tendency: float
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    skills: List[UserSkillOut] = []
    interests: List[InterestOut] = []

    model_config = ConfigDict(from_attributes=True)

class UserOut(BaseModel):
    id: int
    email: str
    is_active: bool
    created_at: datetime
    profile: Optional[ProfileOut] = None

    model_config = ConfigDict(from_attributes=True)
