"""
Standardized psychometric questionnaire items for Big Five, Work Style, and Communication Preferences.
Likert Scale: 1 = Strongly Disagree, 2 = Disagree, 3 = Neutral, 4 = Agree, 5 = Strongly Agree.
"""

QUESTIONNAIRE_ITEMS = [
    # -------------------------------------------------------------
    # 1. PERSONALITY (BIG FIVE) - 15 Items
    # -------------------------------------------------------------
    # Openness
    {
        "category": "personality",
        "dimension": "openness",
        "question_text": "I enjoy experimenting with cutting-edge technologies and novel architectural paradigms.",
        "order_index": 1,
        "reverse_scored": 0
    },
    {
        "category": "personality",
        "dimension": "openness",
        "question_text": "I prefer unconventional and creative problem-solving methods over established routines.",
        "order_index": 2,
        "reverse_scored": 0
    },
    {
        "category": "personality",
        "dimension": "openness",
        "question_text": "I am eager to explore abstract ideas and theoretical frameworks in project development.",
        "order_index": 3,
        "reverse_scored": 0
    },
    # Conscientiousness
    {
        "category": "personality",
        "dimension": "conscientiousness",
        "question_text": "I maintain meticulous documentation, clean code standards, and rigorous test coverage.",
        "order_index": 4,
        "reverse_scored": 0
    },
    {
        "category": "personality",
        "dimension": "conscientiousness",
        "question_text": "I consistently meet project deadlines through proactive task prioritization.",
        "order_index": 5,
        "reverse_scored": 0
    },
    {
        "category": "personality",
        "dimension": "conscientiousness",
        "question_text": "I leave code formatting or project setup disorganized until the last minute.",
        "order_index": 6,
        "reverse_scored": 1
    },
    # Extraversion
    {
        "category": "personality",
        "dimension": "extraversion",
        "question_text": "I feel energized when leading lively group discussions, standups, and public sprint demos.",
        "order_index": 7,
        "reverse_scored": 0
    },
    {
        "category": "personality",
        "dimension": "extraversion",
        "question_text": "I actively initiate conversations and take the lead in team networking.",
        "order_index": 8,
        "reverse_scored": 0
    },
    {
        "category": "personality",
        "dimension": "extraversion",
        "question_text": "I prefer working in quiet solitude without frequent conversational interactions.",
        "order_index": 9,
        "reverse_scored": 1
    },
    # Agreeableness
    {
        "category": "personality",
        "dimension": "agreeableness",
        "question_text": "I actively seek consensus and make sure everyone on the team feels heard and supported.",
        "order_index": 10,
        "reverse_scored": 0
    },
    {
        "category": "personality",
        "dimension": "agreeableness",
        "question_text": "I am patient when assisting teammates who are struggling with unfamiliar tools.",
        "order_index": 11,
        "reverse_scored": 0
    },
    {
        "category": "personality",
        "dimension": "agreeableness",
        "question_text": "I am quick to compromise on technical preferences for the sake of team harmony.",
        "order_index": 12,
        "reverse_scored": 0
    },
    # Emotional Stability (Neuroticism inverted)
    {
        "category": "personality",
        "dimension": "emotional_stability",
        "question_text": "I remain calm, focused, and adaptable under tight sprint deadlines or unexpected system bugs.",
        "order_index": 13,
        "reverse_scored": 0
    },
    {
        "category": "personality",
        "dimension": "emotional_stability",
        "question_text": "I feel easily overwhelmed or anxious when project requirements shift abruptly.",
        "order_index": 14,
        "reverse_scored": 1
    },
    {
        "category": "personality",
        "dimension": "emotional_stability",
        "question_text": "I recover quickly and constructively from technical setbacks or critical code review feedback.",
        "order_index": 15,
        "reverse_scored": 0
    },

    # -------------------------------------------------------------
    # 2. WORK STYLE - 10 Items
    # -------------------------------------------------------------
    # Structured vs Flexible
    {
        "category": "work_style",
        "dimension": "structure_preference",
        "question_text": "I prefer clear sprint roadmaps, predefined milestones, and strict issue tracking over ad-hoc tasks.",
        "order_index": 16,
        "reverse_scored": 0
    },
    {
        "category": "work_style",
        "dimension": "structure_preference",
        "question_text": "I thrive in dynamic, loosely defined environments where we pivot tasks on the fly.",
        "order_index": 17,
        "reverse_scored": 1
    },
    # Independent vs Collaborative
    {
        "category": "work_style",
        "dimension": "collaboration_preference",
        "question_text": "I produce my highest quality work through pair programming and joint problem-solving sessions.",
        "order_index": 18,
        "reverse_scored": 0
    },
    {
        "category": "work_style",
        "dimension": "collaboration_preference",
        "question_text": "I do my best work when given an isolated module to architect and complete independently.",
        "order_index": 19,
        "reverse_scored": 1
    },
    # Fast-paced vs Deliberate
    {
        "category": "work_style",
        "dimension": "pace_preference",
        "question_text": "I prioritize shipping rapid MVPs and iterating quickly over deep upfront perfectionism.",
        "order_index": 20,
        "reverse_scored": 0
    },
    {
        "category": "work_style",
        "dimension": "pace_preference",
        "question_text": "I prefer taking time to evaluate edge cases and architect robust foundations before writing code.",
        "order_index": 21,
        "reverse_scored": 1
    },
    # Planning vs Improvisation
    {
        "category": "work_style",
        "dimension": "planning_preference",
        "question_text": "I write detailed technical specifications and data schemas before touching the codebase.",
        "order_index": 22,
        "reverse_scored": 0
    },
    {
        "category": "work_style",
        "dimension": "planning_preference",
        "question_text": "I prefer jumping directly into prototyping and adapting the design through exploratory code.",
        "order_index": 23,
        "reverse_scored": 1
    },
    # Detail vs Big-Picture
    {
        "category": "work_style",
        "dimension": "detail_orientation",
        "question_text": "I pay deep attention to micro-optimizations, linting rules, and pixel-perfect design alignment.",
        "order_index": 24,
        "reverse_scored": 0
    },
    {
        "category": "work_style",
        "dimension": "detail_orientation",
        "question_text": "I focus primarily on macro-system architecture, product vision, and overall user value.",
        "order_index": 25,
        "reverse_scored": 1
    },

    # -------------------------------------------------------------
    # 3. COMMUNICATION PREFERENCES - 8 Items
    # -------------------------------------------------------------
    # Direct vs Diplomatic
    {
        "category": "communication",
        "dimension": "directness",
        "question_text": "I give direct, candid, unfiltered technical critique in code reviews to resolve issues fastest.",
        "order_index": 26,
        "reverse_scored": 0
    },
    {
        "category": "communication",
        "dimension": "directness",
        "question_text": "I carefully phrase feedback with high diplomacy and tact to preserve teammate confidence.",
        "order_index": 27,
        "reverse_scored": 1
    },
    # Synchronous vs Asynchronous
    {
        "category": "communication",
        "dimension": "async_preference",
        "question_text": "I prefer written asynchronous updates (Slack, Notion, PR threads) rather than frequent video calls.",
        "order_index": 28,
        "reverse_scored": 0
    },
    {
        "category": "communication",
        "dimension": "async_preference",
        "question_text": "I prefer quick real-time huddles and face-to-face calls to hash out technical ambiguity.",
        "order_index": 29,
        "reverse_scored": 1
    },
    # Verbal vs Written
    {
        "category": "communication",
        "dimension": "written_preference",
        "question_text": "I prefer comprehensive written RFCs and documentation over verbal explanations.",
        "order_index": 30,
        "reverse_scored": 0
    },
    {
        "category": "communication",
        "dimension": "written_preference",
        "question_text": "I explain complex concepts much better through whiteboarding or verbal walkthroughs.",
        "order_index": 31,
        "reverse_scored": 1
    },
    # Frequent vs Periodic
    {
        "category": "communication",
        "dimension": "frequency_preference",
        "question_text": "I like continuous status pings and constant lightweight communication throughout the workday.",
        "order_index": 32,
        "reverse_scored": 0
    },
    {
        "category": "communication",
        "dimension": "frequency_preference",
        "question_text": "I prefer batching all updates into a single concise daily or weekly summary.",
        "order_index": 33,
        "reverse_scored": 1
    }
]
