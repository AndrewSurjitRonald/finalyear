from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.user import Skill
from app.schemas.user import SkillOut

router = APIRouter()

@router.get("/", response_model=List[SkillOut])
def get_all_skills(db: Session = Depends(get_db)):
    skills = db.query(Skill).order_by(Skill.name.asc()).all()
    return skills
