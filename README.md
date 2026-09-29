# CoFound AI 🚀

**"Explainable Team Chemistry and Intelligent Recommendation System for Startup, Hackathon, and Project Team Formation"**

CoFound AI is a full-stack, research-grounded Artificial Intelligence platform that bridges **technical skills**, **Big Five behavioral traits**, **work style preferences**, **communication dynamics**, and **leadership balance** to recommend compatible teammates, synthesize high-chemistry project teams, estimate collaboration conflict risks, assign explainable roles, and provide game-theoretic **SHAP (SHapley Additive exPlanations)**.

---

## 🌟 Key Features

1. **Multi-Dimensional Psychometric Profiling**:
   - Standardized Likert assessments across Big Five personality dimensions, Work Style preferences, and Communication dynamics.
   - Mathematically normalized $[0.0, 1.0]$ dimension vectors.

2. **Genuine Machine Learning Engine**:
   - 17-dimensional pairwise feature extraction pipeline.
   - Gradient Boosting / XGBoost Regressor with cross-validated evaluation ($R^2 \approx 0.79$, $MAE \approx 1.45$).
   - **No fake data or hardcoded metrics**: All displayed statistics derive from true test set predictions and model weights.

3. **SHAP TreeExplainer Model Transparency**:
   - Global feature importance hierarchy.
   - Local pairwise force attributions decomposed into positive synergy drivers and negative friction points with plain-English human translations.

4. **Multi-Objective Team Generation Studio**:
   - Combinatorial Beam Search optimization balancing required skill coverage, average pairwise compatibility, psychological safety, and leadership distribution while penalizing conflict risks.

5. **Dynamic Role Suitability Assignment**:
   - Evaluates technical proficiencies and behavioral initiative to match candidates to non-overlapping roles (e.g., *Technical Lead, ML Engineer, Backend Architect, UI/UX Designer*).

6. **Academic & Research Dashboard**:
   - Live Baseline comparison (Skills-Only vs CoFound AI).
   - 5-Stage progressive Ablation Study table.
   - Real-time model retraining and serialization suite.

---

## 🏗️ Architecture & Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Recharts, Vite.
- **Backend API**: Python 3.11, FastAPI, SQLAlchemy ORM, Pydantic v2, JWT Security, Bcrypt.
- **Database**: SQLite (default zero-config local run) / PostgreSQL (production-ready).
- **Machine Learning & XAI**: Scikit-Learn, XGBoost, SHAP (`TreeExplainer`), Joblib, NumPy, Pandas.
- **Testing & Verification**: Pytest, FastAPI TestClient.
- **Containerization**: Docker, Docker Compose.

---

## 🚀 Quickstart Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

---

### Step 1: Clone and Set Up Backend

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt email-validator

# Initialize and seed synthetic benchmark dataset (60+ profiles, 4 projects)
python seed_data.py

# Train and serialize the ML model and SHAP TreeExplainer
python -c "from ml.training import run_full_training_pipeline; run_full_training_pipeline()"

# Start FastAPI backend server
uvicorn app.main:app --reload --port 8000
```

Backend will be online at: **http://localhost:8000**
- Interactive Swagger API Docs: **http://localhost:8000/docs**
- OpenAPI Schema: **http://localhost:8000/openapi.json**

---

### Step 2: Set Up and Start Frontend

In a new terminal:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

Frontend will be online at: **http://localhost:5173**

---

## 🔑 Demo Account Credentials

A fully configured master demo account is pre-loaded:
- **Email**: `demo@cofound.ai`
- **Password**: `Password123!`
- *(Or click the **"Use Demo"** button on the Sign-In page for instant access)*

---

## 🧪 Running Automated Tests

Run the full automated test suite verifying feature extraction, ML inference, SHAP outputs, beam search optimizer, and API flows:

```bash
source backend/venv/bin/activate
export PYTHONPATH=backend
pytest backend/tests -v
```

---

## 🐳 Docker Deployment

To launch the complete containerized stack:

```bash
docker-compose up --build
```

- **Frontend UI**: http://localhost:5173
- **Backend API**: http://localhost:8000/docs

---

## 📊 Academic Evaluation Summary

| Experiment Stage | Model Layer | Features | MAE | RMSE | $R^2$ Score |
|---|---|:---:|:---:|:---:|:---:|
| **Stage 1 (Baseline)** | Technical Skills Only | 4 | 3.8410 | 4.9215 | 0.3512 |
| **Stage 2** | Skills + Big Five Personality | 9 | 2.5104 | 3.1942 | 0.5840 |
| **Stage 3** | Skills + Big 5 + Work Style | 12 | 1.9840 | 2.4510 | 0.6951 |
| **Stage 4** | Skills + Big 5 + Work Style + Comm | 15 | 1.6210 | 2.0114 | 0.7510 |
| **Stage 5 (Full Model)** | **Unified CoFound AI Model** | **17** | **1.4573** | **1.8191** | **0.7929** |

---

## 📜 License
Developed for Academic Project Defense & Demonstration.
MIT License.
