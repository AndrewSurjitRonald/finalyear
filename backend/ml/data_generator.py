"""
Synthetic Profile and Pairwise Collaboration Dataset Generator.
Generates research-grounded synthetic candidate profiles and pairwise interaction samples
with multi-dimensional non-linear target formulas (incorporating skill synergy,
Big Five harmony, work style alignment, and communication compatibility).
"""

import numpy as np
import random
from typing import List, Dict, Tuple, Any
from ml.feature_engineering import extract_pairwise_features, FEATURE_NAMES

POPULAR_SKILLS = [
    "Python", "JavaScript", "TypeScript", "React", "Node.js", "FastAPI",
    "PostgreSQL", "PyTorch", "TensorFlow", "Scikit-Learn", "Docker", "Kubernetes",
    "AWS", "UI/UX Design", "Figma", "Product Management", "Data Analysis",
    "Tailwind CSS", "Next.js", "GraphQL", "Rust", "Go", "Git"
]

INTEREST_TOPICS = [
    "Healthcare AI", "FinTech", "EdTech", "Climate Tech", "Developer Tools",
    "Generative AI", "Cybersecurity", "Autonomous Systems", "SaaS Platforms", "Bioinformatics"
]

FIRST_NAMES = [
    "Alex", "Priya", "Marcus", "Elena", "Liam", "Aisha", "David", "Sofia",
    "Chen", "Ananya", "Jordan", "Fatima", "Carlos", "Mei", "Arjun", "Chloe",
    "Gabriel", "Zara", "Lucas", "Maya", "Vikram", "Hannah", "Mateo", "Siddharth",
    "Olivia", "Tariq", "Nina", "Kavita", "Ethan", "Nadia", "Rohan", "Ingrid"
]

LAST_NAMES = [
    "Sharma", "Vance", "Patel", "Rodriguez", "Chen", "Kowalski", "Kim", "Gupta",
    "Nakamura", "Al-Mansoor", "Dubois", "Larsson", "O'Connor", "Mendoza", "Iyer",
    "Zhang", "Singh", "Novak", "Adeyemi", "Takahashi", "Rao", "Silva", "Mueller"
]

PROFESSIONS = [
    "Full-Stack Engineer", "ML Research Engineer", "Frontend Specialist",
    "Backend Architect", "UI/UX Designer", "Data Scientist", "Product Manager",
    "DevOps / Cloud Engineer", "AI Systems Engineer"
]

def generate_synthetic_user_profile(user_idx: int, seed: int = None) -> Dict[str, Any]:
    """Generate a single realistic developer/student/founder profile."""
    if seed is not None:
        np.random.seed(seed + user_idx)
        random.seed(seed + user_idx)

    first = random.choice(FIRST_NAMES)
    last = random.choice(LAST_NAMES)
    full_name = f"{first} {last}"
    email = f"{first.lower()}.{last.lower()}{user_idx}@example.com"
    profession = random.choice(PROFESSIONS)

    # Experience
    exp_years = round(float(np.random.gamma(shape=2.5, scale=1.5)), 1)
    if exp_years < 2.0:
        level = "Beginner"
    elif exp_years < 5.0:
        level = "Intermediate"
    elif exp_years < 8.0:
        level = "Advanced"
    else:
        level = "Expert"

    # Skills selection (4 to 8 skills)
    num_skills = random.randint(4, 8)
    chosen_skills = random.sample(POPULAR_SKILLS, num_skills)
    skills_dict = {}
    for sk in chosen_skills:
        # Proficiency 2.0 to 5.0
        prof = round(float(np.clip(np.random.normal(loc=3.5, scale=0.8), 1.5, 5.0)), 1)
        skills_dict[sk] = prof

    # Personality: Big Five (Beta distribution bounded in [0.1, 0.95])
    personality = {
        "openness": round(float(np.clip(np.random.beta(a=3.5, b=2.0), 0.1, 0.99)), 2),
        "conscientiousness": round(float(np.clip(np.random.beta(a=3.0, b=2.2), 0.1, 0.99)), 2),
        "extraversion": round(float(np.clip(np.random.beta(a=2.5, b=2.5), 0.1, 0.99)), 2),
        "agreeableness": round(float(np.clip(np.random.beta(a=3.8, b=2.0), 0.1, 0.99)), 2),
        "emotional_stability": round(float(np.clip(np.random.beta(a=3.2, b=2.2), 0.1, 0.99)), 2),
    }

    # Work Style (0.0 to 1.0)
    work_style = {
        "structure_preference": round(float(np.clip(np.random.uniform(0.15, 0.95), 0.05, 0.95)), 2),
        "collaboration_preference": round(float(np.clip(np.random.uniform(0.2, 0.95), 0.05, 0.95)), 2),
        "pace_preference": round(float(np.clip(np.random.uniform(0.15, 0.95), 0.05, 0.95)), 2),
        "planning_preference": round(float(np.clip(np.random.uniform(0.15, 0.95), 0.05, 0.95)), 2),
        "detail_orientation": round(float(np.clip(np.random.uniform(0.2, 0.95), 0.05, 0.95)), 2),
    }

    # Communication Preferences (0.0 to 1.0)
    communication = {
        "directness": round(float(np.clip(np.random.uniform(0.2, 0.9), 0.1, 0.95)), 2),
        "async_preference": round(float(np.clip(np.random.uniform(0.2, 0.9), 0.1, 0.95)), 2),
        "written_preference": round(float(np.clip(np.random.uniform(0.2, 0.9), 0.1, 0.95)), 2),
        "frequency_preference": round(float(np.clip(np.random.uniform(0.2, 0.9), 0.1, 0.95)), 2),
    }

    # Leadership tendency
    leadership_tendency = round(float(np.clip(np.random.beta(a=2.0, b=2.5), 0.1, 0.95)), 2)

    # Interests (2 to 4)
    interests = random.sample(INTEREST_TOPICS, random.randint(2, 4))

    return {
        "id": user_idx,
        "email": email,
        "full_name": full_name,
        "profession": profession,
        "experience_years": exp_years,
        "experience_level": level,
        "skills": skills_dict,
        "personality": personality,
        "work_style": work_style,
        "communication": communication,
        "leadership_tendency": leadership_tendency,
        "interests": interests
    }

def compute_ground_truth_compatibility(user_a: Dict[str, Any], user_b: Dict[str, Any]) -> float:
    """
    Computes a realistic, non-linear collaborative compatibility score (0.0 to 100.0).
    Incorporates:
    - Technical complementarity & shared foundation
    - Personality harmony & psychological safety
    - Work style synergy
    - Communication friction penalty
    - Leadership clash vs collaboration balance
    - Interest alignment
    """
    # 1. Technical synergy (weight: 25%)
    skills_a = set(user_a.get("skills", {}).keys())
    skills_b = set(user_b.get("skills", {}).keys())
    union = skills_a.union(skills_b)
    inter = skills_a.intersection(skills_b)
    
    # Moderate overlap + high unique complementarity is ideal
    jaccard = len(inter) / max(1, len(union))
    complementarity = len(union - inter) / max(1, len(union))
    tech_score = (0.35 * jaccard + 0.65 * complementarity) * 100.0

    # 2. Personality synergy (weight: 25%)
    p_a = user_a.get("personality", {})
    p_b = user_b.get("personality", {})
    
    agree_min = min(p_a.get("agreeableness", 0.5), p_b.get("agreeableness", 0.5))
    stab_min = min(p_a.get("emotional_stability", 0.5), p_b.get("emotional_stability", 0.5))
    open_avg = (p_a.get("openness", 0.5) + p_b.get("openness", 0.5)) / 2.0
    consc_diff = abs(p_a.get("conscientiousness", 0.5) - p_b.get("conscientiousness", 0.5))
    
    # High agreeableness + emotional stability protects team; high conscientiousness gap hurts
    pers_score = (
        0.35 * agree_min +
        0.25 * stab_min +
        0.20 * open_avg +
        0.20 * (1.0 - consc_diff)
    ) * 100.0

    # 3. Work Style synergy (weight: 20%)
    ws_a = user_a.get("work_style", {})
    ws_b = user_b.get("work_style", {})
    
    struct_diff = abs(ws_a.get("structure_preference", 0.5) - ws_b.get("structure_preference", 0.5))
    collab_align = 1.0 - abs(ws_a.get("collaboration_preference", 0.5) - ws_b.get("collaboration_preference", 0.5))
    pace_diff = abs(ws_a.get("pace_preference", 0.5) - ws_b.get("pace_preference", 0.5))
    
    work_score = (
        0.40 * (1.0 - struct_diff) +
        0.35 * collab_align +
        0.25 * (1.0 - pace_diff)
    ) * 100.0

    # 4. Communication synergy (weight: 15%)
    c_a = user_a.get("communication", {})
    c_b = user_b.get("communication", {})
    
    direct_diff = abs(c_a.get("directness", 0.5) - c_b.get("directness", 0.5))
    async_align = 1.0 - abs(c_a.get("async_preference", 0.5) - c_b.get("async_preference", 0.5))
    freq_align = 1.0 - abs(c_a.get("frequency_preference", 0.5) - c_b.get("frequency_preference", 0.5))
    
    comm_score = (
        0.40 * (1.0 - direct_diff) +
        0.35 * async_align +
        0.25 * freq_align
    ) * 100.0

    # 5. Leadership & Interest synergy (weight: 15%)
    l_a = user_a.get("leadership_tendency", 0.5)
    l_b = user_b.get("leadership_tendency", 0.5)
    if l_a > 0.8 and l_b > 0.8:
        lead_score = 35.0  # Conflict risk
    elif l_a < 0.25 and l_b < 0.25:
        lead_score = 45.0  # Direction void
    else:
        lead_score = (1.0 - abs(l_a - l_b) * 0.2) * 100.0

    int_a = set(user_a.get("interests", []))
    int_b = set(user_b.get("interests", []))
    int_score = (len(int_a.intersection(int_b)) / max(1, len(int_a.union(int_b)))) * 100.0 if (int_a or int_b) else 50.0

    lead_int_score = 0.65 * lead_score + 0.35 * int_score

    # Non-linear composite score with mild stochastic realism
    raw_score = (
        0.25 * tech_score +
        0.25 * pers_score +
        0.20 * work_score +
        0.15 * comm_score +
        0.15 * lead_int_score
    )

    # Add small Gaussian noise for realistic observational variance
    noise = np.random.normal(loc=0.0, scale=1.5)
    final_score = float(np.clip(raw_score + noise, 10.0, 99.0))
    return round(final_score, 2)

def generate_pairwise_dataset(num_users: int = 80, num_pairs: int = 2500, seed: int = 42) -> Tuple[np.ndarray, np.ndarray, List[Dict[str, Any]]]:
    """
    Generate synthetic candidate pool and pairwise feature-target matrices for training.
    """
    np.random.seed(seed)
    random.seed(seed)

    users = [generate_synthetic_user_profile(i + 1, seed=seed) for i in range(num_users)]
    
    X_list = []
    y_list = []

    for _ in range(num_pairs):
        u1, u2 = random.sample(users, 2)
        features = extract_pairwise_features(u1, u2)
        target = compute_ground_truth_compatibility(u1, u2)
        X_list.append(features)
        y_list.append(target)

    X = np.array(X_list, dtype=float)
    y = np.array(y_list, dtype=float)

    return X, y, users
