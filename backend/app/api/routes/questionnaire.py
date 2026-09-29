from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict
from datetime import datetime

from app.core.database import get_db
from app.models.user import User
from app.models.assessment import QuestionnaireItem, AssessmentResponse, AssessmentScore
from app.schemas.assessment import (
    QuestionnaireItemOut, AssessmentSubmission, DimensionScoreOut, AssessmentSummaryOut
)
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/items/{category}", response_model=List[QuestionnaireItemOut])
def get_questionnaire_items(category: str, db: Session = Depends(get_db)):
    """Fetch questionnaire questions for personality, work_style, or communication."""
    items = db.query(QuestionnaireItem).filter(
        QuestionnaireItem.category == category
    ).order_by(QuestionnaireItem.order_index.asc()).all()
    return items

@router.post("/submit", response_model=List[DimensionScoreOut])
def submit_assessment(
    submission: AssessmentSubmission,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submits Likert responses for a psychometric assessment category, computes
    reverse-scored item normalization, and stores calculated dimension scores in [0.0, 1.0].
    """
    if not submission.responses:
        raise HTTPException(status_code=400, detail="No responses provided")

    # Fetch items to verify category and reverse scoring
    item_ids = [r.item_id for r in submission.responses]
    items = db.query(QuestionnaireItem).filter(QuestionnaireItem.id.in_(item_ids)).all()
    item_map = {item.id: item for item in items}

    # Group responses by dimension
    dimension_scores_raw: Dict[str, List[float]] = {}

    for r in submission.responses:
        item = item_map.get(r.item_id)
        if not item:
            continue
        
        # Save or update raw response
        existing_resp = db.query(AssessmentResponse).filter(
            AssessmentResponse.user_id == current_user.id,
            AssessmentResponse.item_id == item.id
        ).first()

        val = max(1, min(5, r.response_value))
        if existing_resp:
            existing_resp.response_value = val
        else:
            db.add(AssessmentResponse(
                user_id=current_user.id,
                item_id=item.id,
                response_value=val
            ))

        # Handle reverse scoring: if reverse_scored == 1, val -> (6 - val)
        effective_val = (6 - val) if item.reverse_scored == 1 else val
        dimension_scores_raw.setdefault(item.dimension, []).append(float(effective_val))

    db.flush()

    # Compute normalized dimension scores
    computed_scores = []
    for dim, val_list in dimension_scores_raw.items():
        raw_mean = sum(val_list) / len(val_list)
        # Normalize 1.0-5.0 scale to 0.0-1.0
        normalized = (raw_mean - 1.0) / 4.0
        normalized = round(max(0.0, min(1.0, normalized)), 3)

        # Update or create AssessmentScore
        score_record = db.query(AssessmentScore).filter(
            AssessmentScore.user_id == current_user.id,
            AssessmentScore.category == submission.category,
            AssessmentScore.dimension == dim
        ).first()

        if score_record:
            score_record.normalized_score = normalized
            score_record.raw_mean = round(raw_mean, 2)
            score_record.updated_at = datetime.utcnow()
        else:
            score_record = AssessmentScore(
                user_id=current_user.id,
                category=submission.category,
                dimension=dim,
                normalized_score=normalized,
                raw_mean=round(raw_mean, 2)
            )
            db.add(score_record)

        computed_scores.append(score_record)

    db.commit()

    return [
        DimensionScoreOut(
            category=s.category,
            dimension=s.dimension,
            normalized_score=s.normalized_score,
            raw_mean=s.raw_mean,
            updated_at=s.updated_at
        ) for s in computed_scores
    ]

@router.get("/summary", response_model=AssessmentSummaryOut)
def get_user_assessment_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve full normalized psychometric profile summary for current user."""
    scores = db.query(AssessmentScore).filter(AssessmentScore.user_id == current_user.id).all()

    personality = {}
    work_style = {}
    communication = {}

    for s in scores:
        if s.category == "personality":
            personality[s.dimension] = s.normalized_score
        elif s.category == "work_style":
            work_style[s.dimension] = s.normalized_score
        elif s.category == "communication":
            communication[s.dimension] = s.normalized_score

    is_complete = bool(personality and work_style and communication)

    return AssessmentSummaryOut(
        user_id=current_user.id,
        personality_scores=personality,
        work_style_scores=work_style,
        communication_scores=communication,
        is_complete=is_complete
    )
