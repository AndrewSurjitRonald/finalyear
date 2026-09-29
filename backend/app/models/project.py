from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    project_type = Column(String(100), default="Startup") # Startup, Hackathon, College Project, Research, Open Source
    target_team_size = Column(Integer, default=4)
    duration_weeks = Column(Integer, default=8)
    domain_category = Column(String(100), default="AI/ML") # Healthcare, FinTech, Web3, AI/ML, SaaS, DevTools
    experience_level_required = Column(String(50), default="Intermediate")
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    creator = relationship("User", back_populates="created_projects")
    requirements = relationship("ProjectRequirement", back_populates="project", cascade="all, delete-orphan")
    teams = relationship("Team", back_populates="project", cascade="all, delete-orphan")


class ProjectRequirement(Base):
    __tablename__ = "project_requirements"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    skill_name = Column(String(100), nullable=False)
    min_proficiency = Column(Float, default=3.0) # 1.0 to 5.0
    importance_weight = Column(Float, default=1.0) # 0.5 to 2.0
    role_name = Column(String(100), nullable=True) # e.g. "ML Engineer", "Frontend Developer", "Lead Architect"

    project = relationship("Project", back_populates="requirements")
