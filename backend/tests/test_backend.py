import pytest
import numpy as np
from fastapi.testclient import TestClient

from app.main import app
from app.core.database import SessionLocal, Base, engine
from ml.feature_engineering import extract_pairwise_features, FEATURE_NAMES
from ml.training import MLInferenceEngine, run_full_training_pipeline
from ml.chemistry_engine import compute_team_chemistry
from ml.role_recommender import recommend_best_role
from ml.team_optimizer import generate_optimal_teams

client = TestClient(app)

@pytest.fixture(scope="session", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield

def test_feature_engineering():
    user_a = {
        "skills": {"Python": 4.5, "FastAPI": 4.0, "React": 3.0},
        "personality": {"openness": 0.8, "conscientiousness": 0.9, "extraversion": 0.7, "agreeableness": 0.85, "emotional_stability": 0.8},
        "work_style": {"structure_preference": 0.8, "collaboration_preference": 0.7, "pace_preference": 0.6},
        "communication": {"directness": 0.6, "async_preference": 0.8, "frequency_preference": 0.7},
        "leadership_tendency": 0.7,
        "interests": ["Healthcare AI", "SaaS"]
    }
    user_b = {
        "skills": {"PyTorch": 4.5, "Python": 4.0, "Data Analysis": 4.0},
        "personality": {"openness": 0.75, "conscientiousness": 0.85, "extraversion": 0.5, "agreeableness": 0.9, "emotional_stability": 0.85},
        "work_style": {"structure_preference": 0.75, "collaboration_preference": 0.8, "pace_preference": 0.65},
        "communication": {"directness": 0.55, "async_preference": 0.75, "frequency_preference": 0.7},
        "leadership_tendency": 0.4,
        "interests": ["Healthcare AI", "Climate Tech"]
    }

    feats = extract_pairwise_features(user_a, user_b, ["Python", "PyTorch", "React"])
    assert isinstance(feats, np.ndarray)
    assert len(feats) == len(FEATURE_NAMES)
    assert feats[0] > 0.0  # Jaccard overlap
    assert feats[1] > 0.0  # Complementarity
    assert feats[2] == 1.0 # 100% required skill coverage

def test_ml_inference_and_shap():
    engine = MLInferenceEngine.get_instance()
    user_a = {
        "id": 1,
        "full_name": "Test Alice",
        "skills": {"Python": 4.0, "React": 3.5},
        "personality": {"openness": 0.8, "conscientiousness": 0.8, "extraversion": 0.6, "agreeableness": 0.8, "emotional_stability": 0.8},
        "work_style": {"structure_preference": 0.7, "collaboration_preference": 0.7, "pace_preference": 0.6},
        "communication": {"directness": 0.6, "async_preference": 0.7, "frequency_preference": 0.6},
        "leadership_tendency": 0.7,
        "interests": ["AI"]
    }
    user_b = {
        "id": 2,
        "full_name": "Test Bob",
        "skills": {"PyTorch": 4.0, "FastAPI": 4.0},
        "personality": {"openness": 0.7, "conscientiousness": 0.8, "extraversion": 0.5, "agreeableness": 0.8, "emotional_stability": 0.8},
        "work_style": {"structure_preference": 0.7, "collaboration_preference": 0.7, "pace_preference": 0.6},
        "communication": {"directness": 0.6, "async_preference": 0.7, "frequency_preference": 0.6},
        "leadership_tendency": 0.4,
        "interests": ["AI"]
    }

    feats = extract_pairwise_features(user_a, user_b)
    pred_compat = engine.predict_compatibility(feats)
    assert 10.0 <= pred_compat <= 100.0

    shap_expl = engine.explain_prediction(feats, "Alice", "Bob")
    assert "base_value" in shap_expl
    assert "predicted_compatibility" in shap_expl
    assert len(shap_expl["top_positive_features"]) > 0
    assert len(shap_expl["all_contributions"]) == len(FEATURE_NAMES)

def test_team_chemistry_and_optimizer():
    members = [
        {
            "id": 1, "full_name": "Lead Eng", "profession": "Full-Stack Engineer",
            "skills": {"Python": 4.5, "FastAPI": 4.0},
            "personality": {"openness": 0.8, "conscientiousness": 0.8, "extraversion": 0.7, "agreeableness": 0.8, "emotional_stability": 0.8},
            "work_style": {"structure_preference": 0.7, "collaboration_preference": 0.8, "pace_preference": 0.6},
            "communication": {"directness": 0.6, "async_preference": 0.7, "frequency_preference": 0.6},
            "leadership_tendency": 0.8
        },
        {
            "id": 2, "full_name": "ML Eng", "profession": "ML Engineer",
            "skills": {"PyTorch": 4.5, "Python": 4.0},
            "personality": {"openness": 0.8, "conscientiousness": 0.8, "extraversion": 0.5, "agreeableness": 0.85, "emotional_stability": 0.8},
            "work_style": {"structure_preference": 0.7, "collaboration_preference": 0.8, "pace_preference": 0.6},
            "communication": {"directness": 0.6, "async_preference": 0.7, "frequency_preference": 0.6},
            "leadership_tendency": 0.4
        },
        {
            "id": 3, "full_name": "UI Designer", "profession": "UI/UX Designer",
            "skills": {"React": 4.5, "UI/UX Design": 4.5, "Figma": 4.5},
            "personality": {"openness": 0.9, "conscientiousness": 0.8, "extraversion": 0.6, "agreeableness": 0.9, "emotional_stability": 0.8},
            "work_style": {"structure_preference": 0.7, "collaboration_preference": 0.8, "pace_preference": 0.6},
            "communication": {"directness": 0.5, "async_preference": 0.7, "frequency_preference": 0.6},
            "leadership_tendency": 0.35
        }
    ]

    engine = MLInferenceEngine.get_instance()
    chem = compute_team_chemistry(members, ["Python", "PyTorch", "React", "UI/UX Design"], engine)
    assert chem["team_chemistry_score"] > 60.0
    assert chem["skill_coverage_score"] == 100.0
    assert chem["conflict_risk_level"] in ["Low", "Medium"]
    assert len(chem["strengths"]) > 0

    role, rscore, reason = recommend_best_role(members[1])
    assert "ML" in role or "Engineer" in role
    assert rscore >= 50.0

def test_api_auth_and_user_flow():
    # 1. Login with demo account
    resp = client.post("/api/v1/auth/login", json={
        "email": "demo@cofound.ai",
        "password": "Password123!"
    })
    assert resp.status_code == 200
    token = resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Get Me
    me_resp = client.get("/api/v1/auth/me", headers=headers)
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == "demo@cofound.ai"

    # 3. Questionnaire items
    q_resp = client.get("/api/v1/questionnaire/items/personality", headers=headers)
    assert q_resp.status_code == 200
    assert len(q_resp.json()) >= 10

    # 4. Teammates recommendations
    recs_resp = client.get("/api/v1/recommendations/teammates?limit=5", headers=headers)
    assert recs_resp.status_code == 200
    recs = recs_resp.json()
    assert len(recs) > 0
    assert recs[0]["overall_compatibility"] > 0.0

    # 5. ML Status
    ml_resp = client.get("/api/v1/ml/status", headers=headers)
    assert ml_resp.status_code == 200
    status_data = ml_resp.json()
    assert status_data["is_trained"] is True
    assert status_data["test_metrics"]["r2_score"] > 0.5
    assert len(status_data["baseline_comparison"]) == 2
    assert len(status_data["ablation_study"]) == 5

    # 6. Analytics Overview
    an_resp = client.get("/api/v1/analytics/overview", headers=headers)
    assert an_resp.status_code == 200
    assert an_resp.json()["total_users"] > 0
