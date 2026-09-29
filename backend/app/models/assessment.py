from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class QuestionnaireItem(Base):
    __tablename__ = "questionnaire_items"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(50), nullable=False)  # 'personality', 'work_style', 'communication'
    dimension = Column(String(100), nullable=False) # e.g., 'openness', 'structured_vs_flexible', 'direct_vs_diplomatic'
    question_text = Column(Text, nullable=False)
    order_index = Column(Integer, default=0)
    reverse_scored = Column(Integer, default=0) # 1 if reverse scored
    
    responses = relationship("AssessmentResponse", back_populates="item")


class AssessmentResponse(Base):
    __tablename__ = "assessment_responses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    item_id = Column(Integer, ForeignKey("questionnaire_items.id"), nullable=False)
    response_value = Column(Integer, nullable=False)  # 1 to 5 Likert score
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="assessment_responses")
    item = relationship("QuestionnaireItem", back_populates="responses")


class AssessmentScore(Base):
    __tablename__ = "assessment_scores"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category = Column(String(50), nullable=False) # 'personality', 'work_style', 'communication'
    dimension = Column(String(100), nullable=False) # e.g., 'openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'
    normalized_score = Column(Float, nullable=False) # 0.0 to 1.0
    raw_mean = Column(Float, nullable=False) # 1.0 to 5.0
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="assessment_scores")
