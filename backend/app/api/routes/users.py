from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.user import User, Profile, Skill, UserSkill, UserInterest
from app.schemas.user import ProfileUpdate, ProfileOut, UserSkillAdd, UserSkillOut, InterestAdd, InterestOut
from app.api.deps import get_current_user

router = APIRouter()

@router.put("/profile", response_model=ProfileOut)
def update_profile(
    profile_in: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = current_user.profile
    if not profile:
        profile = Profile(user_id=current_user.id, full_name="User")
        db.add(profile)
        db.flush()

    update_data = profile_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)

    skills_out = [
        UserSkillOut(
            id=us.id,
            skill_id=us.skill_id,
            name=us.skill.name,
            category=us.skill.category,
            proficiency=us.proficiency,
            years_experience=us.years_experience
        ) for us in profile.skills
    ]

    interests_out = [
        InterestOut(
            id=ui.id,
            interest_tag=ui.interest_tag,
            category=ui.category
        ) for ui in profile.interests
    ]

    return ProfileOut(
        id=profile.id,
        user_id=profile.user_id,
        full_name=profile.full_name,
        avatar_url=profile.avatar_url,
        bio=profile.bio,
        education=profile.education,
        profession=profile.profession,
        experience_years=profile.experience_years,
        experience_level=profile.experience_level,
        weekly_hours_available=profile.weekly_hours_available,
        leadership_tendency=profile.leadership_tendency,
        github_url=profile.github_url,
        linkedin_url=profile.linkedin_url,
        portfolio_url=profile.portfolio_url,
        skills=skills_out,
        interests=interests_out
    )

@router.post("/skills", response_model=UserSkillOut)
def add_user_skill(
    skill_in: UserSkillAdd,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = current_user.profile
    if not profile:
        raise HTTPException(status_code=400, detail="Profile not found")

    # Find or create skill
    skill = db.query(Skill).filter(Skill.name.ilike(skill_in.skill_name.strip())).first()
    if not skill:
        skill = Skill(name=skill_in.skill_name.strip(), category="Technical")
        db.add(skill)
        db.flush()

    # Check if already added
    user_skill = db.query(UserSkill).filter(
        UserSkill.profile_id == profile.id,
        UserSkill.skill_id == skill.id
    ).first()

    if user_skill:
        user_skill.proficiency = skill_in.proficiency
        user_skill.years_experience = skill_in.years_experience
    else:
        user_skill = UserSkill(
            profile_id=profile.id,
            skill_id=skill.id,
            proficiency=skill_in.proficiency,
            years_experience=skill_in.years_experience
        )
        db.add(user_skill)

    db.commit()
    db.refresh(user_skill)

    return UserSkillOut(
        id=user_skill.id,
        skill_id=skill.id,
        name=skill.name,
        category=skill.category,
        proficiency=user_skill.proficiency,
        years_experience=user_skill.years_experience
    )

@router.delete("/skills/{user_skill_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_user_skill(
    user_skill_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = current_user.profile
    if not profile:
        raise HTTPException(status_code=400, detail="Profile not found")

    user_skill = db.query(UserSkill).filter(
        UserSkill.id == user_skill_id,
        UserSkill.profile_id == profile.id
    ).first()

    if not user_skill:
        raise HTTPException(status_code=404, detail="Skill not found on profile")

    db.delete(user_skill)
    db.commit()
    return None

@router.post("/interests", response_model=InterestOut)
def add_user_interest(
    interest_in: InterestAdd,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = current_user.profile
    if not profile:
        raise HTTPException(status_code=400, detail="Profile not found")

    existing = db.query(UserInterest).filter(
        UserInterest.profile_id == profile.id,
        UserInterest.interest_tag.ilike(interest_in.interest_tag.strip())
    ).first()

    if existing:
        return existing

    interest = UserInterest(
        profile_id=profile.id,
        interest_tag=interest_in.interest_tag.strip(),
        category=interest_in.category or "General"
    )
    db.add(interest)
    db.commit()
    db.refresh(interest)
    return interest

@router.delete("/interests/{interest_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_user_interest(
    interest_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = current_user.profile
    if not profile:
        raise HTTPException(status_code=400, detail="Profile not found")

    interest = db.query(UserInterest).filter(
        UserInterest.id == interest_id,
        UserInterest.profile_id == profile.id
    ).first()

    if not interest:
        raise HTTPException(status_code=404, detail="Interest not found on profile")

    db.delete(interest)
    db.commit()
    return None
