from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import json

from app.core.database import get_db
from app.models.user import User
from app.models.project import Project
from app.models.team import Team, TeamMember
from app.schemas.recommendation import TeamGenerateRequest, TeamOut, TeamMemberOut
from app.api.deps import get_current_user
from app.api.routes.recommendations import _build_user_dict
from ml.training import MLInferenceEngine
from ml.team_optimizer import generate_optimal_teams

router = APIRouter()

@router.post("/generate", response_model=List[TeamOut])
def generate_project_teams(
    request: TeamGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generates top candidate teams using multi-objective beam search.
    Computes team chemistry, required skill coverage, leadership distribution, and conflict risk.
    """
    project = db.query(Project).filter(Project.id == request.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    target_size = request.team_size or project.target_team_size or 4
    project_skills = [r.skill_name for r in project.requirements]
    preferred_roles = [r.role_name for r in project.requirements if r.role_name]

    # Fetch candidate pool (including creator/current user if they want to participate)
    users = db.query(User).all()
    candidate_dicts = [_build_user_dict(u, db) for u in users]

    inference_engine = MLInferenceEngine.get_instance()

    generated_teams = generate_optimal_teams(
        candidates=candidate_dicts,
        project_required_skills=project_skills,
        team_size=target_size,
        top_k=4,
        inference_engine=inference_engine,
        preferred_roles=preferred_roles
    )

    out_teams = []
    for gt in generated_teams:
        out_teams.append(TeamOut(
            project_id=project.id,
            name=gt["name"],
            team_chemistry_score=gt["team_chemistry_score"],
            skill_coverage_score=gt["skill_coverage_score"],
            personality_balance_score=gt["personality_balance_score"],
            work_style_balance_score=gt["work_style_balance_score"],
            communication_balance_score=gt["communication_balance_score"],
            leadership_balance_score=gt["leadership_balance_score"],
            conflict_risk_score=gt["conflict_risk_score"],
            conflict_risk_level=gt["conflict_risk_level"],
            members=[TeamMemberOut(**m) for m in gt["members"]],
            strengths=gt["strengths"],
            risks=gt["risks"]
        ))

    return out_teams

@router.post("/save", response_model=TeamOut)
def save_team(
    team_in: TeamOut,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Persists a selected recommended team to the database."""
    team = Team(
        project_id=team_in.project_id,
        name=team_in.name,
        team_chemistry_score=team_in.team_chemistry_score,
        skill_coverage_score=team_in.skill_coverage_score,
        personality_balance_score=team_in.personality_balance_score,
        work_style_balance_score=team_in.work_style_balance_score,
        communication_balance_score=team_in.communication_balance_score,
        leadership_balance_score=team_in.leadership_balance_score,
        conflict_risk_score=team_in.conflict_risk_score,
        conflict_risk_level=team_in.conflict_risk_level,
        strengths_json=json.dumps(team_in.strengths),
        risks_json=json.dumps(team_in.risks)
    )
    db.add(team)
    db.flush()

    for m in team_in.members:
        member = TeamMember(
            team_id=team.id,
            user_id=m.user_id,
            assigned_role=m.assigned_role,
            role_suitability_score=m.role_suitability_score,
            role_reasoning=m.role_reasoning
        )
        db.add(member)

    db.commit()
    db.refresh(team)

    return team_in

@router.get("/project/{project_id}", response_model=List[TeamOut])
def get_project_saved_teams(project_id: int, db: Session = Depends(get_db)):
    teams = db.query(Team).filter(Team.project_id == project_id).all()
    res = []
    for t in teams:
        members_out = []
        for tm in t.members:
            user_dict = _build_user_dict(tm.user, db)
            members_out.append(TeamMemberOut(
                user_id=tm.user_id,
                full_name=user_dict["full_name"],
                profession=user_dict["profession"],
                assigned_role=tm.assigned_role,
                role_suitability_score=tm.role_suitability_score,
                role_reasoning=tm.role_reasoning or "",
                skills=list(user_dict["skills"].keys()),
                avatar_url=user_dict["avatar_url"]
            ))

        strengths = json.loads(t.strengths_json) if t.strengths_json else []
        risks = json.loads(t.risks_json) if t.risks_json else []

        res.append(TeamOut(
            id=t.id,
            project_id=t.project_id,
            name=t.name,
            team_chemistry_score=t.team_chemistry_score,
            skill_coverage_score=t.skill_coverage_score,
            personality_balance_score=t.personality_balance_score,
            work_style_balance_score=t.work_style_balance_score,
            communication_balance_score=t.communication_balance_score,
            leadership_balance_score=t.leadership_balance_score,
            conflict_risk_score=t.conflict_risk_score,
            conflict_risk_level=t.conflict_risk_level,
            members=members_out,
            strengths=strengths,
            risks=risks
        ))
    return res
