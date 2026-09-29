"""
Dynamic and Explainable Project Role Suitability Engine.
Matches candidates to optimal project roles based on skill proficiency, leadership tendency,
psychometric profile, and project requirements.
"""

from typing import Dict, List, Any, Tuple

ROLE_PROFILES = {
    "Technical Lead": {
        "key_skills": ["Architecture", "Python", "TypeScript", "FastAPI", "Node.js", "Docker", "Go", "Rust", "Git"],
        "min_lead": 0.65,
        "pref_workstyle": "planning_preference"
    },
    "ML / AI Engineer": {
        "key_skills": ["Python", "PyTorch", "TensorFlow", "Scikit-Learn", "FastAPI", "Data Analysis", "SHAP", "XGBoost"],
        "min_lead": 0.3,
        "pref_workstyle": "detail_orientation"
    },
    "Backend Architect": {
        "key_skills": ["Python", "FastAPI", "PostgreSQL", "Node.js", "Docker", "Kubernetes", "AWS", "GraphQL", "Go"],
        "min_lead": 0.4,
        "pref_workstyle": "structure_preference"
    },
    "Frontend Specialist": {
        "key_skills": ["React", "TypeScript", "JavaScript", "Tailwind CSS", "Next.js", "UI/UX Design", "Figma"],
        "min_lead": 0.3,
        "pref_workstyle": "detail_orientation"
    },
    "UI/UX Designer": {
        "key_skills": ["UI/UX Design", "Figma", "Tailwind CSS", "React", "Frontend Specialist"],
        "min_lead": 0.4,
        "pref_workstyle": "detail_orientation"
    },
    "Product / Project Lead": {
        "key_skills": ["Product Management", "UI/UX Design", "Data Analysis", "Git", "Scrum"],
        "min_lead": 0.7,
        "pref_workstyle": "collaboration_preference"
    },
    "Data Scientist / Analyst": {
        "key_skills": ["Data Analysis", "Python", "Scikit-Learn", "PostgreSQL", "Pandas", "PyTorch"],
        "min_lead": 0.3,
        "pref_workstyle": "detail_orientation"
    },
    "DevOps / Cloud Engineer": {
        "key_skills": ["Docker", "Kubernetes", "AWS", "PostgreSQL", "Git", "Go", "FastAPI"],
        "min_lead": 0.4,
        "pref_workstyle": "structure_preference"
    }
}

def recommend_best_role(
    user: Dict[str, Any],
    project_required_roles: List[str] = None,
    already_assigned_roles: List[str] = None
) -> Tuple[str, float, str]:
    """
    Computes best role for a candidate within a project team context.
    Returns: (role_name, suitability_score, reasoning_explanation)
    """
    if already_assigned_roles is None:
        already_assigned_roles = []

    user_skills = user.get("skills", {})
    lead_tendency = user.get("leadership_tendency", 0.5)
    profession = user.get("profession", "")
    
    best_role = "Software Engineer"
    best_score = 0.0
    best_reason = ""

    candidate_roles = list(ROLE_PROFILES.keys())
    # If project specified preferred roles, prioritize unfilled ones
    if project_required_roles:
        unfilled_reqs = [r for r in project_required_roles if r not in already_assigned_roles]
        if unfilled_reqs:
            candidate_roles = unfilled_reqs + [r for r in candidate_roles if r not in unfilled_reqs]

    for role_name in candidate_roles:
        spec = ROLE_PROFILES.get(role_name, {
            "key_skills": ["Python", "JavaScript", "Git"],
            "min_lead": 0.4,
            "pref_workstyle": "structure_preference"
        })

        # 1. Skill match score: compute average proficiency of matched relevant skills + density bonus
        matched_skills = [sk for sk in spec["key_skills"] if sk in user_skills]
        if matched_skills:
            avg_prof = sum(user_skills[sk] for sk in matched_skills) / len(matched_skills)
            skill_score = min(100.0, (avg_prof / 5.0) * 80.0 + (len(matched_skills) * 8.0))
        else:
            skill_score = 15.0

        # 2. Leadership suitability
        lead_delta = abs(lead_tendency - spec["min_lead"])
        lead_score = max(0.0, 100.0 - (lead_delta * 60.0))

        # 3. Profession title bonus
        prof_lower = profession.lower()
        role_words = [w.lower().strip('/') for w in role_name.split() if len(w.strip('/')) > 1]
        prof_bonus = 30.0 if any(w in prof_lower for w in role_words) else 0.0

        # Unfilled role priority bonus
        unfilled_bonus = 15.0 if role_name not in already_assigned_roles else -10.0

        total_suitability = (0.55 * skill_score + 0.25 * lead_score + 0.10 * prof_bonus + 0.10 * unfilled_bonus)
        total_suitability = min(98.0, max(40.0, total_suitability))

        if total_suitability > best_score:
            best_score = total_suitability
            best_role = role_name
            
            # Formulate clear rationale
            reasons = []
            if matched_skills:
                reasons.append(f"Strong proficiency in {', '.join(matched_skills[:3])}")
            if "Lead" in role_name and lead_tendency >= 0.65:
                reasons.append(f"Demonstrated leadership drive ({round(lead_tendency * 100)}%)")
            elif "Lead" not in role_name and lead_tendency < 0.6:
                reasons.append("High focus on hands-on implementation and technical depth")
            if prof_bonus > 0:
                reasons.append(f"Direct alignment with background as {profession}")

            best_reason = f"Recommended as {role_name} due to: " + "; ".join(reasons) + "."

    return best_role, round(best_score, 1), best_reason
