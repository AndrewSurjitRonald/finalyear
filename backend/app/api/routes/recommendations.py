from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any

from app.core.database import get_db
from app.models.user import User, Profile, UserSkill, UserInterest
from app.models.assessment import AssessmentScore
from app.models.project import Project
from app.schemas.recommendation import TeammateRecommendationOut, SHAPExplanationOut
from app.api.deps import get_current_user
from ml.training import MLInferenceEngine
from ml.feature_engineering import extract_pairwise_features
from ml.role_recommender import recommend_best_role

router = APIRouter()

def _build_user_dict(user: User, db: Session) -> Dict[str, Any]:
    """Helper to convert ORM user into dictionary format required for feature engineering."""
    profile = user.profile
    skills_dict = {}
    if profile:
        for us in profile.skills:
            skills_dict[us.skill.name] = us.proficiency

    interests_list = []
    if profile:
        interests_list = [ui.interest_tag for ui in profile.interests]

    # Scores
    scores = db.query(AssessmentScore).filter(AssessmentScore.user_id == user.id).all()
    pers = {}
    work = {}
    comm = {}
    for s in scores:
        if s.category == "personality":
            pers[s.dimension] = s.normalized_score
        elif s.category == "work_style":
            work[s.dimension] = s.normalized_score
        elif s.category == "communication":
            comm[s.dimension] = s.normalized_score

    # Defaults if assessment incomplete
    pers_def = {"openness": 0.6, "conscientiousness": 0.6, "extraversion": 0.5, "agreeableness": 0.7, "emotional_stability": 0.6}
    pers_def.update(pers)

    work_def = {"structure_preference": 0.5, "collaboration_preference": 0.6, "pace_preference": 0.5, "planning_preference": 0.5, "detail_orientation": 0.5}
    work_def.update(work)

    comm_def = {"directness": 0.5, "async_preference": 0.5, "written_preference": 0.5, "frequency_preference": 0.5}
    comm_def.update(comm)

    return {
        "id": user.id,
        "email": user.email,
        "full_name": profile.full_name if profile else f"User {user.id}",
        "profession": profile.profession if profile else "Software Developer",
        "experience_level": profile.experience_level if profile else "Intermediate",
        "avatar_url": profile.avatar_url if profile else None,
        "leadership_tendency": profile.leadership_tendency if profile else 0.5,
        "skills": skills_dict,
        "personality": pers_def,
        "work_style": work_def,
        "communication": comm_def,
        "interests": interests_list
    }

@router.get("/teammates", response_model=List[TeammateRecommendationOut])
def get_teammate_recommendations(
    project_id: Optional[int] = Query(None),
    limit: int = Query(20, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Ranks compatible teammates using the trained ML model and real feature engineering.
    Calculates dynamic sub-scores, complementary skills, conflict risk, role fit, and SHAP highlights.
    """
    inference_engine = MLInferenceEngine.get_instance()
    user_a_dict = _build_user_dict(current_user, db)

    # Project requirements if specified
    project_skills = []
    project_roles = []
    if project_id:
        proj = db.query(Project).filter(Project.id == project_id).first()
        if proj:
            project_skills = [r.skill_name for r in proj.requirements]
            project_roles = [r.role_name for r in proj.requirements if r.role_name]

    # Fetch candidates (exclude current user)
    candidate_users = db.query(User).filter(User.id != current_user.id).all()
    if not candidate_users:
        return []

    recommendations = []

    for c_user in candidate_users:
        c_dict = _build_user_dict(c_user, db)

        # Extract features
        features = extract_pairwise_features(user_a_dict, c_dict, project_skills)
        
        # Predict ML compatibility score
        compat_score = inference_engine.predict_compatibility(features)

        # Component sub-scores calculation
        # 1. Technical
        skills_a = set(user_a_dict["skills"].keys())
        skills_b = set(c_dict["skills"].keys())
        shared = list(skills_a.intersection(skills_b))
        complementary = list(skills_b - skills_a)
        
        tech_score = round(min(99.0, max(20.0, (features[0]*30.0 + features[1]*50.0 + features[2]*20.0) * 100.0)), 1)
        pers_score = round(min(99.0, max(25.0, (features[4]*0.3 + features[6]*0.4 + features[7]*0.3) * 100.0)), 1)
        work_score = round(min(99.0, max(25.0, ((1.0 - features[9])*0.4 + features[10]*0.4 + (1.0 - features[11])*0.2) * 100.0)), 1)
        comm_score = round(min(99.0, max(25.0, ((1.0 - features[12])*0.4 + features[13]*0.35 + features[14]*0.25) * 100.0)), 1)
        lead_score = round(min(99.0, max(25.0, features[15] * 100.0)), 1)
        int_score = round(min(99.0, max(20.0, features[16] * 100.0)), 1)

        # Conflict risk score
        conflict_score = round(max(10.0, min(85.0, (100.0 - min(pers_score, comm_score)) * 0.7 + (100.0 - lead_score) * 0.3)), 1)
        if conflict_score < 35.0:
            conflict_level = "Low"
        elif conflict_score < 60.0:
            conflict_level = "Medium"
        else:
            conflict_level = "High"

        # Role assignment & rationale
        best_role, role_suitability, role_reason = recommend_best_role(
            user=c_dict,
            project_required_roles=project_roles
        )

        # SHAP explanation
        shap_explanation = inference_engine.explain_prediction(
            features_1d=features,
            user_a_name=user_a_dict["full_name"],
            user_b_name=c_dict["full_name"]
        )

        # Highlights
        highlights = [h["human_explanation"] for h in shap_explanation["top_positive_features"][:2]]
        if not highlights:
            highlights = [f"Strong baseline alignment with {best_role} capabilities."]

        recommendations.append(TeammateRecommendationOut(
            user_id=c_dict["id"],
            full_name=c_dict["full_name"],
            profession=c_dict["profession"],
            experience_level=c_dict["experience_level"],
            avatar_url=c_dict["avatar_url"],
            overall_compatibility=compat_score,
            technical_score=tech_score,
            personality_score=pers_score,
            work_style_score=work_score,
            communication_score=comm_score,
            leadership_score=lead_score,
            interest_score=int_score,
            conflict_risk=conflict_level,
            conflict_risk_score=conflict_score,
            shared_skills=shared,
            complementary_skills=complementary[:4],
            recommended_role=best_role,
            role_reasoning=role_reason,
            explanation_highlights=highlights,
            shap_summary=SHAPExplanationOut(
                source_user_id=user_a_dict["id"],
                candidate_user_id=c_dict["id"],
                base_value=shap_explanation["base_value"],
                predicted_compatibility=shap_explanation["predicted_compatibility"],
                top_positive_features=shap_explanation["top_positive_features"],
                top_negative_features=shap_explanation["top_negative_features"],
                all_contributions=shap_explanation["all_contributions"]
            )
        ))

    # Rank by overall compatibility descending
    recommendations.sort(key=lambda x: x.overall_compatibility, reverse=True)
    return recommendations[:limit]

@router.get("/explain/{candidate_user_id}", response_model=SHAPExplanationOut)
def get_pairwise_shap_explanation(
    candidate_user_id: int,
    project_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deep SHAP explainability endpoint providing full feature attribution breakdown for a specific candidate."""
    candidate_user = db.query(User).filter(User.id == candidate_user_id).first()
    if not candidate_user:
        raise HTTPException(status_code=404, detail="Candidate user not found")

    inference_engine = MLInferenceEngine.get_instance()
    user_a_dict = _build_user_dict(current_user, db)
    user_b_dict = _build_user_dict(candidate_user, db)

    project_skills = []
    if project_id:
        proj = db.query(Project).filter(Project.id == project_id).first()
        if proj:
            project_skills = [r.skill_name for r in proj.requirements]

    features = extract_pairwise_features(user_a_dict, user_b_dict, project_skills)
    
    explanation = inference_engine.explain_prediction(
        features_1d=features,
        user_a_name=user_a_dict["full_name"],
        user_b_name=user_b_dict["full_name"]
    )

    return SHAPExplanationOut(
        source_user_id=user_a_dict["id"],
        candidate_user_id=user_b_dict["id"],
        base_value=explanation["base_value"],
        predicted_compatibility=explanation["predicted_compatibility"],
        top_positive_features=explanation["top_positive_features"],
        top_negative_features=explanation["top_negative_features"],
        all_contributions=explanation["all_contributions"]
    )
