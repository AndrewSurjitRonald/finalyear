from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from app.core.database import get_db
from app.core.config import settings
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.user import User, Profile
from app.schemas.user import UserCreate, UserLogin, Token, UserOut, ProfileOut
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists."
        )
    
    # Create user
    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        is_active=True
    )
    db.add(user)
    db.flush()

    # Create associated profile
    profile = Profile(
        user_id=user.id,
        full_name=user_in.full_name,
        profession=user_in.profession or "Software Engineer",
        education=user_in.education or "Computer Science",
        experience_years=2.0,
        experience_level="Intermediate",
        weekly_hours_available=20,
        leadership_tendency=0.5
    )
    db.add(profile)
    db.commit()
    db.refresh(user)

    access_token = create_access_token(subject=str(user.id))
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "email": user.email
    }

@router.post("/login", response_model=Token)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(subject=str(user.id))
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "email": user.email
    }

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = current_user.profile
    profile_out = None
    if profile:
        skills_out = []
        for us in profile.skills:
            skills_out.append({
                "id": us.id,
                "skill_id": us.skill_id,
                "name": us.skill.name,
                "category": us.skill.category,
                "proficiency": us.proficiency,
                "years_experience": us.years_experience
            })
        
        interests_out = []
        for ui in profile.interests:
            interests_out.append({
                "id": ui.id,
                "interest_tag": ui.interest_tag,
                "category": ui.category
            })

        profile_out = ProfileOut(
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

    return UserOut(
        id=current_user.id,
        email=current_user.email,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
        profile=profile_out
    )
