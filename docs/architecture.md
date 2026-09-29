# System Architecture — CoFound AI

## 1. Overview
CoFound AI is an academic and production-ready intelligent platform for forming high-chemistry, complementary, and conflict-resilient collaborative teams.

```
+-------------------------------------------------------------------------+
|                           React + Vite Frontend                         |
|  - Discovery & Recommendation Hub    - Team Generator Studio (Beam Search) |
|  - SHAP Waterfall & Radar Visualizer - Research & Ablation Laboratory  |
+------------------------------------+------------------------------------+
                                     |  REST API / JWT
                                     v
+------------------------------------+------------------------------------+
|                           FastAPI Backend Layer                         |
|  - Auth & Security (/auth)           - Psychometrics & Normalization    |
|  - Project & Roster Management       - Analytics & Distribution Metrics  |
+------------------------------------+------------------------------------+
                                     |
                                     +---> [SQLAlchemy ORM + SQLite/PostgreSQL]
                                     |
                                     v
+------------------------------------+------------------------------------+
|                         Machine Learning Pipeline                       |
|  - 17-Dimensional Pairwise Feature Extractor (Skills, Big 5, Comm, Lead)|
|  - Gradient Boosting & XGBoost Regressor (Test R² ~ 0.79, MAE ~ 1.45)   |
|  - TreeExplainer SHAP Game-Theoretic Decomposition Engine               |
|  - Combinatorial Multi-Objective Beam Search Team Formation Engine     |
+-------------------------------------------------------------------------+
```

## 2. Core Subsystems

### 2.1 Psychometric Profiling Engine
- **Big Five Factor Structure**: 15 Likert scale items mapping to Openness, Conscientiousness, Extraversion, Agreeableness, Emotional Stability.
- **Work Style Preferences**: 10 items assessing Structure vs Flexibility, Pace, Collaboration vs Autonomy, Planning vs Improvisation, and Detail vs Big Picture.
- **Communication Dynamics**: 8 items assessing Directness vs Diplomacy, Async vs Synchronous, Written vs Verbal, and Frequency.
- **Scoring Normalization**: Reverse-coded items are inverted $(6 - x)$ and mathematically mapped onto $[0.0, 1.0]$ unit intervals.

### 2.2 Feature Engineering Pipeline
Pairwise interaction vectors $\vec{x} \in \mathbb{R}^{17}$ capture:
1. Technical Jaccard Overlap
2. Technical Complementarity
3. Project Required Skill Coverage
4. Average Proficiency
5. Big Five Cosine Similarity
6. Extraversion Synergy Index
7. Minimum Pairwise Agreeableness (Psychological Safety)
8. Minimum Emotional Stability (Resilience)
9. Conscientiousness Alignment
10. Work Style Structure Gap
11. Collaboration Synergy
12. Velocity / Pace Gap
13. Directness Delta
14. Async / Sync Alignment
15. Communication Frequency Harmony
16. Leadership Complementarity
17. Domain Interest Overlap

### 2.3 Team Chemistry & Conflict Risk Estimator
- **Team Chemistry Score**: Weighted composite of average pairwise ML compatibility, required skill coverage, Big Five psychological safety, work style alignment, and leadership balance.
- **Conflict Risk**: Signal detector penalizing multiple dominant leaders, low collective agreeableness, and feedback directness mismatch.
- **Role Allocation**: Rule + proficiency maximization matching members to specialized roles (e.g. Technical Lead, ML Engineer, UI/UX Specialist).

### 2.4 Explainability Engine (SHAP)
- Integrates `shap.TreeExplainer` calculating base expected values $E[f(x)]$ and exact Shapley attribution $\phi_i$ for each feature.
- Dual-mode visualization: Plain-English contextual rationale and technical SHAP waterfall charts.
