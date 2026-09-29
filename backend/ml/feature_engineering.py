"""
Feature engineering pipeline for pairwise teammate compatibility and team-level metrics.
Computes mathematically grounded features across technical skills, Big Five personality,
work style, communication style, leadership balance, and shared interests.
"""

import numpy as np
from typing import Dict, List, Any, Tuple

# Feature definition metadata: Name, Human Label, Category, Description
FEATURE_METADATA = [
    {
        "name": "tech_jaccard_sim",
        "label": "Skill Overlap (Jaccard)",
        "category": "Technical",
        "desc": "Shared technical skill overlap between both candidates"
    },
    {
        "name": "tech_complementarity",
        "label": "Skill Complementarity",
        "category": "Technical",
        "desc": "Unique non-overlapping skills that broaden team capability"
    },
    {
        "name": "tech_required_coverage",
        "label": "Required Skill Coverage",
        "category": "Technical",
        "desc": "Joint coverage of project required skills by the pair"
    },
    {
        "name": "tech_proficiency_avg",
        "label": "Average Skill Proficiency",
        "category": "Technical",
        "desc": "Mean depth of experience in key technical tools"
    },
    {
        "name": "big5_cosine_sim",
        "label": "Personality Cosine Similarity",
        "category": "Personality",
        "desc": "Overall alignment across Big Five behavioral profiles"
    },
    {
        "name": "extraversion_synergy",
        "label": "Extraversion Synergy",
        "category": "Personality",
        "desc": "Balance between communicative drive and focused execution"
    },
    {
        "name": "agreeableness_min",
        "label": "Baseline Agreeableness",
        "category": "Personality",
        "desc": "Minimum empathy/cooperation threshold between pair"
    },
    {
        "name": "emotional_stability_min",
        "label": "Stress Resilience",
        "category": "Personality",
        "desc": "Minimum emotional stability threshold under sprint pressure"
    },
    {
        "name": "conscientiousness_alignment",
        "label": "Quality & Rigor Alignment",
        "category": "Personality",
        "desc": "Similarity in code standards, thoroughness, and discipline"
    },
    {
        "name": "workstyle_structure_diff",
        "label": "Structure Preference Delta",
        "category": "Work Style",
        "desc": "Difference in desire for formal sprint roadmaps vs agile pivots"
    },
    {
        "name": "workstyle_collab_alignment",
        "label": "Collaboration Synergy",
        "category": "Work Style",
        "desc": "Harmonious pairing of pair-programming vs modular autonomy"
    },
    {
        "name": "workstyle_pace_diff",
        "label": "Velocity / Pace Gap",
        "category": "Work Style",
        "desc": "Difference in rapid MVP iteration vs deliberate deep architecture"
    },
    {
        "name": "comm_directness_diff",
        "label": "Communication Directness Gap",
        "category": "Communication",
        "desc": "Difference in candid direct feedback vs diplomatic phrasing"
    },
    {
        "name": "comm_async_alignment",
        "label": "Async / Sync Preference",
        "category": "Communication",
        "desc": "Mutual preference for written Slack/PRs vs real-time voice huddles"
    },
    {
        "name": "comm_frequency_alignment",
        "label": "Update Frequency Harmony",
        "category": "Communication",
        "desc": "Mutual agreement on continuous pings vs batched daily digests"
    },
    {
        "name": "leadership_complementarity",
        "label": "Leadership Balance",
        "category": "Leadership",
        "desc": "Synergistic leader-contributor distribution avoiding leadership clash or vacuum"
    },
    {
        "name": "interest_overlap",
        "label": "Shared Domain Interests",
        "category": "Interests",
        "desc": "Common passion for domain topics (e.g. AI/ML, FinTech, Healthcare)"
    }
]

FEATURE_NAMES = [f["name"] for f in FEATURE_METADATA]
FEATURE_LABEL_MAP = {f["name"]: f["label"] for f in FEATURE_METADATA}
FEATURE_CATEGORY_MAP = {f["name"]: f["category"] for f in FEATURE_METADATA}

def extract_pairwise_features(
    user_a: Dict[str, Any],
    user_b: Dict[str, Any],
    project_required_skills: List[str] = None
) -> np.ndarray:
    """
    Extract a dense 1D feature vector representing the multi-dimensional compatibility
    between User A and User B.
    """
    if project_required_skills is None:
        project_required_skills = []

    # 1. Technical Skills Features
    skills_a = set(user_a.get("skills", {}).keys())
    skills_b = set(user_b.get("skills", {}).keys())
    
    intersection = skills_a.intersection(skills_b)
    union = skills_a.union(skills_b)
    
    jaccard = len(intersection) / max(1, len(union))
    # Complementarity: proportion of unique skills brought by both
    complementarity = len(union - intersection) / max(1, len(union))
    
    # Required skill coverage
    if project_required_skills:
        req_set = set(project_required_skills)
        covered_by_pair = (skills_a.union(skills_b)).intersection(req_set)
        required_coverage = len(covered_by_pair) / max(1, len(req_set))
    else:
        required_coverage = min(1.0, len(union) / 6.0)

    # Average proficiency in shared + unique skills
    profs_a = list(user_a.get("skills", {}).values()) or [3.0]
    profs_b = list(user_b.get("skills", {}).values()) or [3.0]
    avg_proficiency = ((np.mean(profs_a) + np.mean(profs_b)) / 2.0) / 5.0

    # 2. Personality (Big Five) Features
    # Dimensions: openness, conscientiousness, extraversion, agreeableness, emotional_stability (0.0 to 1.0)
    p_a = np.array([
        user_a.get("personality", {}).get("openness", 0.5),
        user_a.get("personality", {}).get("conscientiousness", 0.5),
        user_a.get("personality", {}).get("extraversion", 0.5),
        user_a.get("personality", {}).get("agreeableness", 0.5),
        user_a.get("personality", {}).get("emotional_stability", 0.5)
    ], dtype=float)

    p_b = np.array([
        user_b.get("personality", {}).get("openness", 0.5),
        user_b.get("personality", {}).get("conscientiousness", 0.5),
        user_b.get("personality", {}).get("extraversion", 0.5),
        user_b.get("personality", {}).get("agreeableness", 0.5),
        user_b.get("personality", {}).get("emotional_stability", 0.5)
    ], dtype=float)

    norm_a = np.linalg.norm(p_a)
    norm_b = np.linalg.norm(p_b)
    if norm_a > 0 and norm_b > 0:
        big5_cos = float(np.dot(p_a, p_b) / (norm_a * norm_b))
    else:
        big5_cos = 0.5

    # Extraversion synergy: optimal if one is moderately expressive and one moderately reflective
    extra_a, extra_b = p_a[2], p_b[2]
    extra_synergy = 1.0 - abs(extra_a - (1.0 - extra_b)) * 0.5

    agree_min = float(min(p_a[3], p_b[3]))
    stab_min = float(min(p_a[4], p_b[4]))
    conscientious_align = 1.0 - abs(p_a[1] - p_b[1])

    # 3. Work Style Features
    # structure_preference, collaboration_preference, pace_preference, planning_preference, detail_orientation
    ws_a = user_a.get("work_style", {})
    ws_b = user_b.get("work_style", {})

    struct_diff = abs(ws_a.get("structure_preference", 0.5) - ws_b.get("structure_preference", 0.5))
    collab_align = 1.0 - abs(ws_a.get("collaboration_preference", 0.5) - ws_b.get("collaboration_preference", 0.5))
    pace_diff = abs(ws_a.get("pace_preference", 0.5) - ws_b.get("pace_preference", 0.5))

    # 4. Communication Features
    # directness, async_preference, written_preference, frequency_preference
    comm_a = user_a.get("communication", {})
    comm_b = user_b.get("communication", {})

    direct_diff = abs(comm_a.get("directness", 0.5) - comm_b.get("directness", 0.5))
    async_align = 1.0 - abs(comm_a.get("async_preference", 0.5) - comm_b.get("async_preference", 0.5))
    freq_align = 1.0 - abs(comm_a.get("frequency_preference", 0.5) - comm_b.get("frequency_preference", 0.5))

    # 5. Leadership Balance
    lead_a = float(user_a.get("leadership_tendency", 0.5))
    lead_b = float(user_b.get("leadership_tendency", 0.5))
    # Two ultra-dominant leaders (>0.85) create friction; two passive (<0.2) create vacuum;
    # Ideal: 1 leader + 1 collaborator or moderate balanced
    if lead_a > 0.8 and lead_b > 0.8:
        lead_comp = 0.35 # High clash risk
    elif lead_a < 0.25 and lead_b < 0.25:
        lead_comp = 0.45 # Leadership vacuum
    else:
        lead_comp = 1.0 - (abs(lead_a - lead_b) * 0.2) # Complementary leadership

    # 6. Interests Overlap
    int_a = set(user_a.get("interests", []))
    int_b = set(user_b.get("interests", []))
    if int_a or int_b:
        int_overlap = len(int_a.intersection(int_b)) / max(1, len(int_a.union(int_b)))
    else:
        int_overlap = 0.5

    features = np.array([
        jaccard,
        complementarity,
        required_coverage,
        avg_proficiency,
        big5_cos,
        extra_synergy,
        agree_min,
        stab_min,
        conscientious_align,
        struct_diff,
        collab_align,
        pace_diff,
        direct_diff,
        async_align,
        freq_align,
        lead_comp,
        int_overlap
    ], dtype=float)

    return features
