"""
Team Formation Optimizer using Combinatorial Multi-Objective Beam Search.
Synthesizes candidate pools to construct high-chemistry, complementary, and conflict-resilient teams.
"""

import itertools
from typing import List, Dict, Any, Tuple
from ml.chemistry_engine import compute_team_chemistry
from ml.role_recommender import recommend_best_role
from ml.feature_engineering import extract_pairwise_features

TEAM_NAME_VARIANTS = [
    "Team Apex", "Team Synergy", "Team Catalyst", "Team Nexus",
    "Team Velocity", "Team Quantum", "Team Horizon", "Team Vanguard"
]

def generate_optimal_teams(
    candidates: List[Dict[str, Any]],
    project_required_skills: List[str],
    team_size: int = 4,
    top_k: int = 3,
    inference_engine = None,
    preferred_roles: List[str] = None
) -> List[Dict[str, Any]]:
    """
    Generates top K ranked team configurations using multi-objective beam search.
    """
    if len(candidates) < team_size:
        # If candidate pool is smaller than team size, return single team with all candidates
        team_size = len(candidates)
        if team_size == 0:
            return []

    # Filter out or score candidates by requirement relevance
    scored_candidates = []
    for c in candidates:
        skills = set(c.get("skills", {}).keys())
        overlap = len(skills.intersection(set(project_required_skills))) if project_required_skills else 1
        scored_candidates.append((overlap, c))

    # Sort candidates by skill relevance to focus beam search
    scored_candidates.sort(key=lambda x: x[0], reverse=True)
    pool = [c[1] for c in scored_candidates[:min(25, len(scored_candidates))]]

    # Generate combinations
    all_combos = list(itertools.combinations(pool, team_size))
    
    # If combinations are very large, sample top subset
    if len(all_combos) > 400:
        import random
        random.seed(42)
        all_combos = all_combos[:150] + random.sample(all_combos[150:], 250)

    evaluated_teams = []

    for combo in all_combos:
        members_list = list(combo)
        chem = compute_team_chemistry(
            members=members_list,
            project_required_skills=project_required_skills,
            inference_engine=inference_engine
        )

        # Multi-objective fitness function
        fitness = (
            0.40 * chem["team_chemistry_score"] +
            0.35 * chem["skill_coverage_score"] +
            0.15 * chem["leadership_balance_score"] -
            0.10 * chem["conflict_risk_score"]
        )

        evaluated_teams.append((fitness, members_list, chem))

    # Rank by fitness
    evaluated_teams.sort(key=lambda x: x[0], reverse=True)

    # Select top K distinct teams
    result_teams = []
    for rank_idx, (fit, members, chem) in enumerate(evaluated_teams[:top_k]):
        team_name = TEAM_NAME_VARIANTS[rank_idx % len(TEAM_NAME_VARIANTS)]
        
        # Assign roles to members
        assigned_roles = []
        assigned_members = []
        for m in members:
            best_role, role_score, role_reason = recommend_best_role(
                user=m,
                project_required_roles=preferred_roles,
                already_assigned_roles=assigned_roles
            )
            assigned_roles.append(best_role)
            assigned_members.append({
                "user_id": m["id"],
                "full_name": m["full_name"],
                "profession": m["profession"],
                "assigned_role": best_role,
                "role_suitability_score": role_score,
                "role_reasoning": role_reason,
                "skills": list(m.get("skills", {}).keys()),
                "avatar_url": m.get("avatar_url")
            })

        result_teams.append({
            "project_id": 0, # Will be set by API caller
            "name": team_name,
            "team_chemistry_score": chem["team_chemistry_score"],
            "skill_coverage_score": chem["skill_coverage_score"],
            "personality_balance_score": chem["personality_balance_score"],
            "work_style_balance_score": chem["work_style_balance_score"],
            "communication_balance_score": chem["communication_balance_score"],
            "leadership_balance_score": chem["leadership_balance_score"],
            "conflict_risk_score": chem["conflict_risk_score"],
            "conflict_risk_level": chem["conflict_risk_level"],
            "members": assigned_members,
            "strengths": chem["strengths"],
            "risks": chem["risks"]
        })

    return result_teams
