# API Specification — CoFound AI RESTful Backend

The **CoFound AI** backend is constructed using **FastAPI** with structured Pydantic v2 validation, JWT authentication, and comprehensive Swagger/OpenAPI documentation available at `/docs`.

Base URL: `http://localhost:8000/api/v1`

---

## 1. Authentication & User Management

### `POST /auth/register`
Registers a new user account and creates their initial blank profile.
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "full_name": "Jane Doe",
    "profession": "Machine Learning Engineer",
    "education": "M.S. Artificial Intelligence"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "user_id": 42,
    "email": "user@example.com"
  }
  ```

### `POST /auth/login`
Authenticates an existing user and issues a JWT token.
- **Request Body**:
  ```json
  {
    "email": "demo@cofound.ai",
    "password": "Password123!"
  }
  ```
- **Response** (`200 OK`): JWT Token object.

### `GET /auth/me`
Retrieves the authenticated user's profile, including their registered technical skills and interests.
- **Headers**: `Authorization: Bearer <token>`
- **Response** (`200 OK`): User and Profile object with nested skills array.

### `PUT /auth/profile`
Updates user profile information (bio, availability, GitHub/LinkedIn links, leadership tendency).
- **Request Body**: `ProfileUpdate` object.

### `POST /auth/skills`
Adds or updates a technical skill for the user with proficiency (1.0 - 5.0) and years of experience.
- **Request Body**:
  ```json
  {
    "skill_name": "PyTorch",
    "proficiency": 4.5,
    "years_experience": 3.0
  }
  ```

---

## 2. Psychometric Assessments

### `GET /assessment/questions`
Returns all 33 standardized Likert questions categorized into `personality` (Big Five), `work_style`, and `communication`.

### `POST /assessment/submit`
Submits raw Likert answers (1 to 5) for an assessment category, inverts reverse-coded items, and computes normalized $[0.0, 1.0]$ dimensional scores.
- **Request Body**:
  ```json
  {
    "category": "personality",
    "responses": [
      { "item_id": 1, "response_value": 5 },
      { "item_id": 2, "response_value": 4 }
    ]
  }
  ```

### `GET /assessment/summary`
Retrieves the complete multidimensional psychometric profile for the current user.

---

## 3. Project Management

### `GET /projects/`
Lists all collaborative projects created on the platform with requirements and creator details.

### `POST /projects/`
Creates a new collaboration project with target team size, duration, domain category, and required technical skills.
- **Request Body**:
  ```json
  {
    "title": "Autonomous Robotics Vision",
    "description": "Building edge AI vision models for robotic navigation",
    "project_type": "Startup",
    "target_team_size": 4,
    "duration_weeks": 12,
    "domain_category": "Robotics/AI",
    "experience_level_required": "Advanced",
    "requirements": [
      { "skill_name": "Python", "min_proficiency": 4.0, "importance_weight": 1.5, "role_name": "ML Lead" },
      { "skill_name": "PyTorch", "min_proficiency": 4.0, "importance_weight": 1.5, "role_name": "Vision Engineer" },
      { "skill_name": "C++", "min_proficiency": 3.5, "importance_weight": 1.2, "role_name": "Embedded Developer" },
      { "skill_name": "Docker", "min_proficiency": 3.0, "importance_weight": 1.0, "role_name": "DevOps Engineer" }
    ]
  }
  ```

---

## 4. Teammate Recommendations & Explainable AI (XAI)

### `GET /recommendations/teammates`
Returns ranked candidate recommendations tailored to the current user, computing genuine 17D pairwise ML predictions, sub-scores, and conflict flags.
- **Query Params**:
  - `project_id` (optional): Filter & weight for a specific project
  - `limit` (default: 20): Max candidates to return

### `GET /recommendations/explain/{candidate_id}`
Computes an on-demand game-theoretic **SHAP local explanation** for the pairwise compatibility between the active user and the target candidate.
- **Response** (`200 OK`):
  - Base expected value $E[f(x)]$
  - Final predicted score $f(x)$
  - Array of positive and negative Shapley feature contributions $\phi_i$
  - Plain-English natural language synthesis

---

## 5. Combinatorial Team Formation Optimizer

### `POST /teams/generate`
Executes multi-objective combinatorial beam search to synthesize optimal multi-member teams.
- **Request Body**:
  ```json
  {
    "project_id": 1,
    "team_size": 4,
    "weights": {
      "skill_coverage": 0.35,
      "pairwise_compatibility": 0.35,
      "psychological_safety": 0.15,
      "leadership_balance": 0.15
    },
    "max_teams": 3
  }
  ```
- **Response** (`200 OK`): Array of generated team configurations with full roster, aggregate chemistry score, conflict risk assessment, and dynamic role assignments.

---

## 6. Machine Learning Research & Platform Analytics

### `GET /ml/status`
Returns live training status, metadata, baseline comparisons, 5-stage ablation study metrics, and global SHAP feature importances.

### `POST /ml/retrain`
Triggers full retraining of the Gradient Boosting Regressor model on the synthetic benchmark dataset, recalibrates the SHAP TreeExplainer, and saves serialized artifacts to disk.

### `GET /analytics/dashboard`
Returns platform-wide distributions, compatibility histograms, skill supply vs demand, and conflict risk demographics.
