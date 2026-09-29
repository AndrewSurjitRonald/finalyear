from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    assessment_responses = relationship("AssessmentResponse", back_populates="user", cascade="all, delete-orphan")
    assessment_scores = relationship("AssessmentScore", back_populates="user", cascade="all, delete-orphan")
    created_projects = relationship("Project", back_populates="creator", cascade="all, delete-orphan")
    team_memberships = relationship("TeamMember", back_populates="user", cascade="all, delete-orphan")


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    avatar_url = Column(String(512), nullable=True)
    bio = Column(Text, nullable=True)
    education = Column(String(255), nullable=True)
    profession = Column(String(255), nullable=True)
    experience_years = Column(Float, default=1.0)
    experience_level = Column(String(50), default="Intermediate") # Beginner, Intermediate, Advanced, Expert
    timezone = Column(String(100), default="UTC+00:00")
    weekly_hours_available = Column(Integer, default=20)
    github_url = Column(String(255), nullable=True)
    linkedin_url = Column(String(255), nullable=True)
    portfolio_url = Column(String(255), nullable=True)
    
    # Leadership tendency self-report or derived score (0.0 - 1.0)
    leadership_tendency = Column(Float, default=0.5)
    
    user = relationship("User", back_populates="profile")
    skills = relationship("UserSkill", back_populates="profile", cascade="all, delete-orphan")
    interests = relationship("UserInterest", back_populates="profile", cascade="all, delete-orphan")


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    category = Column(String(100), default="Technical") # Frontend, Backend, ML/AI, UI/UX, Cloud, Data, Management

    user_skills = relationship("UserSkill", back_populates="skill")


class UserSkill(Base):
    __tablename__ = "user_skills"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("profiles.id"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    proficiency = Column(Float, default=3.0) # 1.0 (Beginner) to 5.0 (Expert)
    years_experience = Column(Float, default=1.0)

    profile = relationship("Profile", back_populates="skills")
    skill = relationship("Skill", back_populates="user_skills")


class UserInterest(Base):
    __tablename__ = "user_interests"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("profiles.id"), nullable=False)
    interest_tag = Column(String(100), nullable=False)
    category = Column(String(100), default="General") # Healthcare, FinTech, EdTech, Climate, AI/ML, SaaS

    profile = relationship("Profile", back_populates="interests")
