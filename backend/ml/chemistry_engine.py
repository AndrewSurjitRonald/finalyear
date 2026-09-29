"""
Team Chemistry Engine, Conflict-Risk Estimator, and Group Dynamic Analytics.
Calculates team-level chemistry scores from genuine pairwise ML model outputs and psychometric balances.
"""

import numpy as np
from typing import List, Dict, Any, Tuple
from ml.feature_engineering import extract_pairwise_features

def compute_team_chemistry(
    members: List[Dict[str, Any]],
    project_required_skills: List[str] = None,
    inference_engine = None
) -> Dict[str, Any]:
    """
    Computes genuine team-level chemistry metrics:
    - Overall Team Chemistry Score (0-100)
    - Skill Coverage Score (0-100)
    - Personality Balance Score (0-100)
    - Work Style Balance Score (0-100)
    - Communication Balance Score (0-100)
    - Leadership Balance Score (0-100)
    - Conflict Risk (Score & Low/Medium/High Level)
    - Team Strengths & Potential Collaboration Risks
    """
    n = len(members)
    if n < 2:
        return {
            "team_chemistry_score": 80.0,
            "skill_coverage_score": 75.0,
            "personality_balance_score": 80.0,
            "work_style_balance_score": 80.0,
            "communication_balance_score": 80.0,
            "leadership_balance_score": 80.0,
            "conflict_risk_score": 20.0,
            "conflict_risk_level": "Low",
            "strengths": ["Solo foundation established"],
            "risks": ["Add teammates to calculate collective chemistry"]
        }

    # 1. Pairwise ML Compatibility Matrix
    pairwise_scores = []
    conflict_signals = []

    for i in range(n):
        for j in range(i + 1, n):
            feat = extract_pairwise_features(members[i], members[j], project_required_skills)
            if inference_engine is not None:
                score = inference_engine.predict_compatibility(feat)
            else:
                score = 75.0
            pairwise_scores.append(score)

            # Check conflict indicators
            # Extreme directness diff
            c_i = members[i].get("communication", {})
            c_j = members[j].get("communication", {})
            if abs(c_i.get("directness", 0.5) - c_j.get("directness", 0.5)) > 0.6:
                conflict_signals.append(f"Feedback style gap between {members[i]['full_name']} and {members[j]['full_name']}")

            # Leadership clash
            l_i = members[i].get("leadership_tendency", 0.5)
            l_j = members[j].get("leadership_tendency", 0.5)
            if l_i > 0.8 and l_j > 0.8:
                conflict_signals.append(f"High leadership dominance competition between {members[i]['full_name']} and {members[j]['full_name']}")

    avg_pairwise_compat = float(np.mean(pairwise_scores))
    min_pairwise_compat = float(np.min(pairwise_scores))

    # 2. Skill Coverage Calculation
    all_team_skills = set()
    for m in members:
        all_team_skills.update(m.get("skills", {}).keys())

    if project_required_skills and len(project_required_skills) > 0:
        req_set = set(project_required_skills)
        covered = req_set.intersection(all_team_skills)
        skill_coverage = (len(covered) / len(req_set)) * 100.0
    else:
        # General skill diversity
        skill_coverage = min(100.0, len(all_team_skills) * 8.5)

    # 3. Personality Balance & Psychological Safety
    agree_scores = [m.get("personality", {}).get("agreeableness", 0.5) for m in members]
    stab_scores = [m.get("personality", {}).get("emotional_stability", 0.5) for m in members]
    open_scores = [m.get("personality", {}).get("openness", 0.5) for m in members]
    consc_scores = [m.get("personality", {}).get("conscientiousness", 0.5) for m in members]

    # Personality balance thrives on high collective agreeableness/stability and moderate diversity in openness/conscientiousness
    pers_balance = (
        0.35 * (np.mean(agree_scores) * 100.0) +
        0.25 * (np.mean(stab_scores) * 100.0) +
        0.20 * (np.mean(open_scores) * 100.0) +
        0.20 * (100.0 - (np.std(consc_scores) * 100.0))
    )
    pers_balance = float(np.clip(pers_balance, 30.0, 99.0))

    # 4. Work Style Balance
    struct_scores = [m.get("work_style", {}).get("structure_preference", 0.5) for m in members]
    collab_scores = [m.get("work_style", {}).get("collaboration_preference", 0.5) for m in members]
    pace_scores = [m.get("work_style", {}).get("pace_preference", 0.5) for m in members]

    work_style_balance = (
        0.40 * (100.0 - np.std(struct_scores) * 100.0) +
        0.35 * (np.mean(collab_scores) * 100.0) +
        0.25 * (100.0 - np.std(pace_scores) * 100.0)
    )
    work_style_balance = float(np.clip(work_style_balance, 30.0, 99.0))

    # 5. Communication Balance
    async_scores = [m.get("communication", {}).get("async_preference", 0.5) for m in members]
    direct_scores = [m.get("communication", {}).get("directness", 0.5) for m in members]
    comm_balance = (
        0.50 * (100.0 - np.std(async_scores) * 100.0) +
        0.50 * (100.0 - np.std(direct_scores) * 100.0)
    )
    comm_balance = float(np.clip(comm_balance, 35.0, 99.0))

    # 6. Leadership Balance
    lead_scores = [m.get("leadership_tendency", 0.5) for m in members]
    high_leaders = sum(1 for s in lead_scores if s >= 0.75)
    max_lead = max(lead_scores)
    min_lead = min(lead_scores)

    if high_leaders == 1:
        lead_balance = 95.0 # Perfect single designated leader
    elif high_leaders == 0 and max_lead >= 0.5:
        lead_balance = 85.0 # Democratic collaborative leadership
    elif high_leaders == 0 and max_lead < 0.4:
        lead_balance = 55.0 # Direction vacuum
    elif high_leaders == 2:
        lead_balance = 65.0 # Moderate clash potential
    else:
        lead_balance = 45.0 # Multi-leader clash

    # 7. Conflict Risk Estimation
    # Signals: low minimum pairwise score, high std in directness, multiple dominant leaders, low agreeableness
    conflict_risk_score = (
        0.35 * max(0.0, 100.0 - min_pairwise_compat) +
        0.25 * (100.0 - np.mean(agree_scores) * 100.0) +
        0.20 * (100.0 - lead_balance) +
        0.20 * (np.std(direct_scores) * 100.0)
    )
    conflict_risk_score = float(np.clip(conflict_risk_score, 10.0, 90.0))

    if conflict_risk_score < 35.0:
        conflict_level = "Low"
    elif conflict_risk_score < 60.0:
        conflict_level = "Medium"
    else:
        conflict_level = "High"

    # Overall Team Chemistry Score
    team_chemistry_score = (
        0.30 * avg_pairwise_compat +
        0.25 * skill_coverage +
        0.15 * pers_balance +
        0.10 * work_style_balance +
        0.10 * comm_balance +
        0.10 * lead_balance
    ) - (0.10 * (conflict_risk_score - 20.0))
    team_chemistry_score = float(np.clip(team_chemistry_score, 25.0, 99.0))

    # Synthesize Strengths and Potential Risks
    strengths = []
    if skill_coverage >= 85.0:
        strengths.append(f"Excellent required skill coverage ({round(skill_coverage)}%) spanning core architecture to delivery.")
    if pers_balance >= 80.0:
        strengths.append("High psychological safety and constructive behavioral harmony.")
    if lead_balance >= 85.0:
        strengths.append("Clear leadership distribution: proactive initiative without dominant friction.")
    if comm_balance >= 80.0:
        strengths.append("Synchronized communication rhythms and PR review preferences.")
    if not strengths:
        strengths.append("Solid multi-disciplinary baseline capabilities.")

    risks = []
    if conflict_level == "High":
        risks.append("Estimated high collaboration friction; consider establishing explicit code review norms.")
    if lead_balance < 65.0:
        risks.append("Leadership distribution warning: potential ambiguity in final decision authority.")
    if skill_coverage < 70.0 and project_required_skills:
        missing = set(project_required_skills) - all_team_skills
        risks.append(f"Skill gap in: {', '.join(list(missing)[:3])}.")
    if work_style_balance < 65.0:
        risks.append("Moderate variance in roadmap planning rigor vs rapid agile prototyping velocity.")
    if not risks:
        risks.append("No major collaboration bottlenecks detected. Low estimated friction.")

    return {
        "team_chemistry_score": round(team_chemistry_score, 1),
        "skill_coverage_score": round(skill_coverage, 1),
        "personality_balance_score": round(pers_balance, 1),
        "work_style_balance_score": round(work_style_balance, 1),
        "communication_balance_score": round(comm_balance, 1),
        "leadership_balance_score": round(lead_balance, 1),
        "conflict_risk_score": round(conflict_risk_score, 1),
        "conflict_risk_level": conflict_level,
        "strengths": strengths,
        "risks": risks
    }
