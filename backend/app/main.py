from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.models import (
    User, Profile, Skill, UserSkill, UserInterest,
    QuestionnaireItem, AssessmentResponse, AssessmentScore,
    Project, ProjectRequirement, Team, TeamMember, MLModelVersion
)
from app.services.questionnaire_definitions import QUESTIONNAIRE_ITEMS
from app.api.routes import auth, users, skills, questionnaire, projects, recommendations, teams, ml, analytics
from ml.training import MLInferenceEngine

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Initialize DB tables
    print("[*] Creating database schema tables...")
    Base.metadata.create_all(bind=engine)

    # 2. Seed default questionnaire items if table is empty
    db = SessionLocal()
    try:
        count = db.query(QuestionnaireItem).count()
        if count == 0:
            print("[*] Initializing psychometric questionnaire item bank...")
            for item in QUESTIONNAIRE_ITEMS:
                q_item = QuestionnaireItem(
                    category=item["category"],
                    dimension=item["dimension"],
                    question_text=item["question_text"],
                    order_index=item["order_index"],
                    reverse_scored=item["reverse_scored"]
                )
                db.add(q_item)
            db.commit()
            print(f"[+] Initialized {len(QUESTIONNAIRE_ITEMS)} questionnaire items.")
    finally:
        db.close()

    # 3. Load or train ML model on startup
    print("[*] Initializing CoFound AI ML Inference Engine...")
    MLInferenceEngine.get_instance()
    print("[+] CoFound AI backend service is online and ready!")
    
    yield
    print("[*] Shutting down CoFound AI backend...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.PROJECT_DESCRIPTION,
    version=settings.VERSION,
    lifespan=lifespan
)

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routes
api_prefix = settings.API_V1_STR
app.include_router(auth.router, prefix=f"{api_prefix}/auth", tags=["Authentication"])
app.include_router(users.router, prefix=f"{api_prefix}/users", tags=["Users & Profiles"])
app.include_router(skills.router, prefix=f"{api_prefix}/skills", tags=["Skills"])
app.include_router(questionnaire.router, prefix=f"{api_prefix}/questionnaire", tags=["Questionnaire & Assessments"])
app.include_router(projects.router, prefix=f"{api_prefix}/projects", tags=["Projects"])
app.include_router(recommendations.router, prefix=f"{api_prefix}/recommendations", tags=["Teammate Recommendations & SHAP"])
app.include_router(teams.router, prefix=f"{api_prefix}/teams", tags=["Team Formation & Chemistry"])
app.include_router(ml.router, prefix=f"{api_prefix}/ml", tags=["Machine Learning & Explainability"])
app.include_router(analytics.router, prefix=f"{api_prefix}/analytics", tags=["Platform Analytics"])

@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "status": "online",
        "version": settings.VERSION,
        "docs_url": "/docs",
        "openapi_url": "/openapi.json"
    }
