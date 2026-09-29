from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    name = Column(String(100), nullable=False)
    team_chemistry_score = Column(Float, nullable=False) # 0 to 100
    skill_coverage_score = Column(Float, nullable=False) # 0 to 100
    personality_balance_score = Column(Float, nullable=False) # 0 to 100
    work_style_balance_score = Column(Float, nullable=False) # 0 to 100
    communication_balance_score = Column(Float, nullable=False) # 0 to 100
    leadership_balance_score = Column(Float, nullable=False) # 0 to 100
    conflict_risk_score = Column(Float, nullable=False) # 0 to 100 (higher = riskier)
    conflict_risk_level = Column(String(20), default="Low") # Low, Medium, High
    strengths_json = Column(Text, nullable=True) # JSON list of strength strings
    risks_json = Column(Text, nullable=True) # JSON list of potential risk strings
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="teams")
    members = relationship("TeamMember", back_populates="team", cascade="all, delete-orphan")


class TeamMember(Base):
    __tablename__ = "team_members"

    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_role = Column(String(100), nullable=False) # e.g. "ML Engineer"
    role_suitability_score = Column(Float, default=85.0) # 0 to 100
    role_reasoning = Column(Text, nullable=True)

    team = relationship("Team", back_populates="members")
    user = relationship("User", back_populates="team_memberships")


class RecommendationLog(Base):
    __tablename__ = "recommendation_logs"

    id = Column(Integer, primary_key=True, index=True)
    source_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    candidate_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    overall_compatibility = Column(Float, nullable=False) # 0 to 100
    technical_score = Column(Float, nullable=False)
    personality_score = Column(Float, nullable=False)
    work_style_score = Column(Float, nullable=False)
    communication_score = Column(Float, nullable=False)
    leadership_score = Column(Float, nullable=False)
    interest_score = Column(Float, nullable=False)
    conflict_risk = Column(String(20), default="Low")
    top_positive_features_json = Column(Text, nullable=True) # JSON
    top_negative_features_json = Column(Text, nullable=True) # JSON
    created_at = Column(DateTime, default=datetime.utcnow)
