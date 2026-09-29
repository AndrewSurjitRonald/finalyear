from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.user import User
from app.models.project import Project, ProjectRequirement
from app.schemas.project import ProjectCreate, ProjectOut, ProjectRequirementOut
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
def create_project(
    project_in: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = Project(
        title=project_in.title,
        description=project_in.description,
        project_type=project_in.project_type,
        target_team_size=project_in.target_team_size,
        duration_weeks=project_in.duration_weeks,
        domain_category=project_in.domain_category,
        experience_level_required=project_in.experience_level_required,
        creator_id=current_user.id
    )
    db.add(project)
    db.flush()

    for req in project_in.requirements:
        p_req = ProjectRequirement(
            project_id=project.id,
            skill_name=req.skill_name.strip(),
            min_proficiency=req.min_proficiency,
            importance_weight=req.importance_weight,
            role_name=req.role_name
        )
        db.add(p_req)

    db.commit()
    db.refresh(project)

    return project

@router.get("/", response_model=List[ProjectOut])
def list_projects(db: Session = Depends(get_db)):
    projects = db.query(Project).order_by(Project.created_at.desc()).all()
    return projects

@router.get("/{project_id}", response_model=ProjectOut)
def get_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project
