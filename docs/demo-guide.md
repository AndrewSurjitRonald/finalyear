# Live Demonstration & Academic Review Guide — CoFound AI

This guide provides a structured, 5-minute walkthrough script and demonstration checklist for presenting **CoFound AI** during an academic project review, viva, or live demo.

---

## ⏱️ 5-Minute Demonstration Script

### Part 1: The Problem & Research Thesis (0:00 - 1:00)
- **Concept**: Explain why conventional team formation (keyword matching, manual pairing, friendship bias) fails in startups and hackathons.
- **Thesis**: Multi-disciplinary teams require not just complementary skills, but also behavioral alignment, communication harmony, psychological safety, and balanced leadership dominance.
- **Academic Innovation**: CoFound AI extracts a 17-dimensional synergistic feature space and uses an Ensemble Tree regressor with **SHAP TreeExplainer** for explainability and **Beam Search** for combinatorial team synthesis.

---

### Part 2: Assessment & Profile Setup (1:00 - 2:00)
1. Navigate to **http://localhost:5173** and click **"Use Demo Account"** to sign in as *Alex Chen* (Full-Stack AI Lead).
2. Go to **"Psychometrics"** in the navigation bar.
3. Show the 3 psychometric assessment wizards:
   - **Big Five Personality** (15 items)
   - **Work Style Preferences** (10 items)
   - **Communication Dynamics** (8 items)
4. Point out the live **Psychometric Radar Chart** illustrating Alex's high Openness, Conscientiousness, and Direct Feedback preference.

---

### Part 3: Teammate Discovery & Pairwise SHAP XAI (2:00 - 3:15)
1. Click **"Discovery"** in the navbar.
2. Select a target project filter (e.g., *"HealthAI Diagnostics Platform"*).
3. Observe how candidate profiles are dynamically ranked by predicted compatibility score ($0-100\%$).
4. Click **"View SHAP Explanation"** on the top recommendation (e.g., *Sarah Lin*).
5. Highlight the game-theoretic SHAP breakdown:
   - **Base Expected Value**: Average platform compatibility baseline ($E[f(x)] \approx 72.4\%$).
   - **Positive Drivers (Green)**: High Skill Complementarity (+4.2%), Strong Psychological Safety (+3.1%), Harmonious Pace Alignment (+2.8%).
   - **Negative Drivers (Red)**: Directness delta (-1.2%).
   - **Plain-English Summary**: Contextual natural language explanation generated for human comprehension.

---

### Part 4: Multi-Objective Team Generator Studio (3:15 - 4:15)
1. Click **"Team Generator"** in the navbar.
2. Select **"HealthAI Diagnostics Platform"** and target team size of **4 members**.
3. Adjust the optimization weight sliders:
   - Increase *Psychological Safety* weight to 40%.
   - Click **"Generate High-Chemistry Teams"**.
4. Observe the Beam Search optimizer results:
   - Top 3 Pareto-optimal rosters.
   - Aggregate Team Chemistry Score (e.g., $91.4\%$).
   - 100% Skill Coverage verification.
   - Dynamic Role Allocations (*ML Lead, Backend Architect, UI/UX Designer, Clinical Data Specialist*).
   - Conflict Risk: **Low (12%)**.

---

### Part 5: Research & Ablation Laboratory (4:15 - 5:00)
1. Navigate to **"Research Lab"** in the navbar.
2. Point out the empirical evaluation benchmarks:
   - **Baseline Model (Technical Skills Only)**: $R^2 = 0.3512, MAE = 3.8410$.
   - **Full Unified CoFound AI Model**: $R^2 = 0.7929, MAE = 1.4573$ (**+125% variance explained**).
3. Walk through the 5-Stage Ablation Study table proving the predictive value added by each psychometric layer.
4. Show the **Global SHAP Feature Importance Hierarchy** chart.
5. Click **"Trigger Model Retraining"** to demonstrate the live backend pipeline retraining the model in under 2 seconds.

---

## 🎯 Key Questions & Answers for Evaluators

**Q: Where does the training data come from?**
> A: The model is trained on a 1,200-pair synthetic collaboration dataset generated using empirical distributions derived from published organizational psychology literature (Woolley et al., Tuarob et al., Big Five psychometrics). The pipeline can also ingest real-world team ratings.

**Q: Why use SHAP instead of feature importance from Random Forest?**
> A: Standard Gini importance only provides global summary numbers for the whole model. SHAP uses cooperative game theory (Shapley values) to compute exact, local feature attributions for any specific pair of people, explaining precisely why two individuals will or will not collaborate effectively.

**Q: How does the team formation avoid combinatorial explosion?**
> A: Finding an optimal subset from $N$ candidates is NP-hard ($O(\binom{N}{k})$). We employ a multi-objective Beam Search with pruning based on skill requirements, keeping the top $B=20$ partial candidate sets at each expansion step, executing in $O(B \cdot N \cdot k)$ polynomial time.
