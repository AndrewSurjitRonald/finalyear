"""
Synthetic Seed Data Generator for CoFound AI Platform.
Populates the database with ~60 realistic profiles, psychometric assessments,
skill inventories, and representative collaborative projects.
Explicitly labeled: [SYNTHETIC DEMONSTRATION & BENCHMARK DATASET].
"""

import os
import sys

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal, Base, engine
from app.core.security import get_password_hash
from app.models.user import User, Profile, Skill, UserSkill, UserInterest
from app.models.assessment import QuestionnaireItem, AssessmentScore
from app.models.project import Project, ProjectRequirement
from app.services.questionnaire_definitions import QUESTIONNAIRE_ITEMS
from ml.data_generator import generate_synthetic_user_profile

def seed_database():
    print("=" * 70)
    print("COFOUND AI - SEEDING SYNTHETIC DEMONSTRATION & RESEARCH DATASET")
    print("=" * 70)

    # Initialize tables
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Seed Questionnaire Item Bank
        print("[1/5] Checking and seeding psychometric questionnaire items...")
        if db.query(QuestionnaireItem).count() == 0:
            for item in QUESTIONNAIRE_ITEMS:
                q_item = QuestionnaireItem(
                    category=item["category"],
                    dimension=item["dimension"],
                    question_text=item["question_text"],
                    order_index=item["order_index"],
                    reverse_scored=item["reverse_scored"]
                )
                db.add(q_item)
            db.commit()
            print(f" -> Successfully seeded {len(QUESTIONNAIRE_ITEMS)} questionnaire items.")

        # 2. Seed Skills Catalog
        print("[2/5] Seeding core technical and design skills catalog...")
        skills_master = [
            ("Python", "Backend / AI"),
            ("JavaScript", "Frontend"),
            ("TypeScript", "Frontend"),
            ("React", "Frontend"),
            ("Node.js", "Backend"),
            ("FastAPI", "Backend"),
            ("PostgreSQL", "Database"),
            ("PyTorch", "ML/AI"),
            ("TensorFlow", "ML/AI"),
            ("Scikit-Learn", "ML/AI"),
            ("Docker", "DevOps / Cloud"),
            ("Kubernetes", "DevOps / Cloud"),
            ("AWS", "DevOps / Cloud"),
            ("UI/UX Design", "Design"),
            ("Figma", "Design"),
            ("Product Management", "Management"),
            ("Data Analysis", "Data"),
            ("Tailwind CSS", "Frontend"),
            ("Next.js", "Frontend"),
            ("GraphQL", "Backend"),
            ("Rust", "Systems"),
            ("Go", "Systems"),
            ("Git", "Tools"),
            ("Solidity", "Blockchain")
        ]

        skill_records = {}
        for sname, scat in skills_master:
            existing = db.query(Skill).filter(Skill.name == sname).first()
            if not existing:
                existing = Skill(name=sname, category=scat)
                db.add(existing)
                db.flush()
            skill_records[sname] = existing
        db.commit()
        print(f" -> Skills catalog ready ({len(skill_records)} skills).")

        # 3. Create Master Demo User
        print("[3/5] Creating primary Demo User (demo@cofound.ai / Password123!)...")
        demo_user = db.query(User).filter(User.email == "demo@cofound.ai").first()
        if not demo_user:
            demo_user = User(
                email="demo@cofound.ai",
                hashed_password=get_password_hash("Password123!"),
                is_active=True
            )
            db.add(demo_user)
            db.flush()

            demo_profile = Profile(
                user_id=demo_user.id,
                full_name="Alex Chen",
                avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
                bio="Full-stack engineer & AI enthusiast passionate about explainable collaborative intelligence.",
                education="M.S. in Computer Science",
                profession="Full-Stack AI Engineer",
                experience_years=3.5,
                experience_level="Advanced",
                weekly_hours_available=25,
                leadership_tendency=0.72,
                github_url="https://github.com/alexchen",
                linkedin_url="https://linkedin.com/in/alexchen"
            )
            db.add(demo_profile)
            db.flush()

            # Add Demo User Skills
            for sname, prof in [("Python", 4.5), ("FastAPI", 4.0), ("React", 4.2), ("TypeScript", 3.8), ("PyTorch", 3.5)]:
                if sname in skill_records:
                    db.add(UserSkill(
                        profile_id=demo_profile.id,
                        skill_id=skill_records[sname].id,
                        proficiency=prof,
                        years_experience=3.0
                    ))

            # Add Demo User Interests
            for itag in ["Healthcare AI", "SaaS Platforms", "Developer Tools"]:
                db.add(UserInterest(profile_id=demo_profile.id, interest_tag=itag, category="AI/ML"))

            # Add Demo User Psychometrics
            demo_psych = [
                ("personality", "openness", 0.85, 4.4),
                ("personality", "conscientiousness", 0.80, 4.2),
                ("personality", "extraversion", 0.65, 3.6),
                ("personality", "agreeableness", 0.88, 4.5),
                ("personality", "emotional_stability", 0.82, 4.3),
                ("work_style", "structure_preference", 0.70, 3.8),
                ("work_style", "collaboration_preference", 0.75, 4.0),
                ("work_style", "pace_preference", 0.65, 3.6),
                ("work_style", "planning_preference", 0.72, 3.9),
                ("work_style", "detail_orientation", 0.80, 4.2),
                ("communication", "directness", 0.60, 3.4),
                ("communication", "async_preference", 0.75, 4.0),
                ("communication", "written_preference", 0.70, 3.8),
                ("communication", "frequency_preference", 0.65, 3.6)
            ]
            for cat, dim, norm, raw in demo_psych:
                db.add(AssessmentScore(
                    user_id=demo_user.id,
                    category=cat,
                    dimension=dim,
                    normalized_score=norm,
                    raw_mean=raw
                ))

            db.commit()
            print(" -> Created demo user Alex Chen.")

        # 4. Generate ~60 Synthetic Candidate Personas
        print("[4/5] Generating ~60 synthetic candidate personas...")
        existing_users_count = db.query(User).count()
        if existing_users_count < 50:
            for i in range(1, 61):
                p_data = generate_synthetic_user_profile(i + 100, seed=1000 + i)
                
                # Check if email exists
                if db.query(User).filter(User.email == p_data["email"]).first():
                    continue

                user = User(
                    email=p_data["email"],
                    hashed_password=get_password_hash("Password123!"),
                    is_active=True
                )
                db.add(user)
                db.flush()

                # Avatar assignment
                avatar_idx = (i % 8) + 1
                avatar_url = f"https://images.unsplash.com/photo-{1500000000000 + i*1234567 % 100000000}?w=150&auto=format&fit=crop&q=80"
                
                profile = Profile(
                    user_id=user.id,
                    full_name=p_data["full_name"],
                    avatar_url=None, # Clean fallback avatar rendered by UI initials
                    bio=f"Passionate {p_data['profession']} with {p_data['experience_years']} years experience.",
                    education="B.S. in Computer Science & Engineering",
                    profession=p_data["profession"],
                    experience_years=p_data["experience_years"],
                    experience_level=p_data["experience_level"],
                    weekly_hours_available=20,
                    leadership_tendency=p_data["leadership_tendency"]
                )
                db.add(profile)
                db.flush()

                # Add skills
                for sname, prof in p_data["skills"].items():
                    if sname in skill_records:
                        db.add(UserSkill(
                            profile_id=profile.id,
                            skill_id=skill_records[sname].id,
                            proficiency=prof,
                            years_experience=max(1.0, round(prof * 0.8, 1))
                        ))

                # Add interests
                for itag in p_data["interests"]:
                    db.add(UserInterest(
                        profile_id=profile.id,
                        interest_tag=itag,
                        category="Domain"
                    ))

                # Add Psychometric Dimension Scores
                for dim, val in p_data["personality"].items():
                    db.add(AssessmentScore(
                        user_id=user.id,
                        category="personality",
                        dimension=dim,
                        normalized_score=val,
                        raw_mean=round(val * 4.0 + 1.0, 2)
                    ))

                for dim, val in p_data["work_style"].items():
                    db.add(AssessmentScore(
                        user_id=user.id,
                        category="work_style",
                        dimension=dim,
                        normalized_score=val,
                        raw_mean=round(val * 4.0 + 1.0, 2)
                    ))

                for dim, val in p_data["communication"].items():
                    db.add(AssessmentScore(
                        user_id=user.id,
                        category="communication",
                        dimension=dim,
                        normalized_score=val,
                        raw_mean=round(val * 4.0 + 1.0, 2)
                    ))

            db.commit()
            print(f" -> Seeded {db.query(User).count()} total users in database.")

        # 5. Create Representative Projects
        print("[5/5] Creating benchmark collaboration projects...")
        if db.query(Project).count() == 0:
            projects_data = [
                {
                    "title": "AI Healthcare Diagnostics Assistant",
                    "description": "Building an intelligent multimodal clinical diagnostic copilot for radiologists and physicians with explainable decision support.",
                    "project_type": "Startup",
                    "target_team_size": 5,
                    "duration_weeks": 12,
                    "domain_category": "Healthcare AI",
                    "experience_level_required": "Advanced",
                    "requirements": [
                        ("Python", 4.0, 1.5, "ML / AI Engineer"),
                        ("PyTorch", 4.0, 1.5, "ML / AI Engineer"),
                        ("React", 3.5, 1.2, "Frontend Specialist"),
                        ("UI/UX Design", 3.5, 1.0, "UI/UX Designer"),
                        ("FastAPI", 3.5, 1.2, "Backend Architect")
                    ]
                },
                {
                    "title": "DeFi Autonomous Risk & Liquidity Protocol",
                    "description": "Developing a real-time risk mitigation and high-frequency automated liquidity balancer on Ethereum L2.",
                    "project_type": "Hackathon",
                    "target_team_size": 4,
                    "duration_weeks": 4,
                    "domain_category": "FinTech",
                    "experience_level_required": "Intermediate",
                    "requirements": [
                        ("Go", 3.8, 1.4, "Backend Architect"),
                        ("TypeScript", 3.8, 1.2, "Frontend Specialist"),
                        ("React", 3.5, 1.0, "Frontend Specialist"),
                        ("PostgreSQL", 3.5, 1.0, "Backend Architect")
                    ]
                },
                {
                    "title": "EcoTrack: Global Carbon Footprint Analytics",
                    "description": "Open-source telemetry and carbon emission offset tracker aggregating enterprise energy usage APIs.",
                    "project_type": "Open Source",
                    "target_team_size": 4,
                    "duration_weeks": 8,
                    "domain_category": "Climate Tech",
                    "experience_level_required": "Intermediate",
                    "requirements": [
                        ("Python", 3.5, 1.2, "Data Scientist / Analyst"),
                        ("Data Analysis", 3.5, 1.3, "Data Scientist / Analyst"),
                        ("FastAPI", 3.5, 1.0, "Backend Architect"),
                        ("UI/UX Design", 3.0, 1.0, "UI/UX Designer")
                    ]
                },
                {
                    "title": "NextGen Multi-Agent Simulation Engine",
                    "description": "Academic research project simulating emergent collaborative behaviors in decentralized LLM-driven autonomous agents.",
                    "project_type": "Research",
                    "target_team_size": 4,
                    "duration_weeks": 16,
                    "domain_category": "AI/ML",
                    "experience_level_required": "Expert",
                    "requirements": [
                        ("Python", 4.5, 1.5, "Technical Lead"),
                        ("PyTorch", 4.2, 1.4, "ML / AI Engineer"),
                        ("Docker", 3.5, 1.0, "DevOps / Cloud Engineer"),
                        ("Scikit-Learn", 4.0, 1.2, "ML / AI Engineer")
                    ]
                }
            ]

            for p_info in projects_data:
                proj = Project(
                    title=p_info["title"],
                    description=p_info["description"],
                    project_type=p_info["project_type"],
                    target_team_size=p_info["target_team_size"],
                    duration_weeks=p_info["duration_weeks"],
                    domain_category=p_info["domain_category"],
                    experience_level_required=p_info["experience_level_required"],
                    creator_id=demo_user.id
                )
                db.add(proj)
                db.flush()

                for sname, min_prof, weight, rname in p_info["requirements"]:
                    db.add(ProjectRequirement(
                        project_id=proj.id,
                        skill_name=sname,
                        min_proficiency=min_prof,
                        importance_weight=weight,
                        role_name=rname
                    ))

            db.commit()
            print(" -> Seeded 4 benchmark projects.")

        print("=" * 70)
        print("[+] SEEDING COMPLETED SUCCESSFULLY!")
        print("    Demo Account: demo@cofound.ai | Password: Password123!")
        print("=" * 70)

    except Exception as e:
        db.rollback()
        print(f"[!] Error during seeding: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
