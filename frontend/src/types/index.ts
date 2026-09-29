export interface User {
  id: number;
  email: string;
  is_active: boolean;
  created_at: string;
  profile?: Profile;
}

export interface UserSkill {
  id: number;
  skill_id: number;
  name: string;
  category: string;
  proficiency: number;
  years_experience: number;
}

export interface UserInterest {
  id: number;
  interest_tag: string;
  category: string;
}

export interface Profile {
  id: number;
  user_id: number;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  education?: string;
  profession?: string;
  experience_years: number;
  experience_level: string;
  weekly_hours_available: number;
  leadership_tendency: number;
  github_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  skills: UserSkill[];
  interests: UserInterest[];
}

export interface QuestionnaireItem {
  id: number;
  category: string;
  dimension: string;
  question_text: string;
  order_index: number;
  reverse_scored: number;
}

export interface DimensionScore {
  category: string;
  dimension: string;
  normalized_score: number; // 0.0 to 1.0
  raw_mean: number;
  updated_at: string;
}

export interface AssessmentSummary {
  user_id: number;
  personality_scores: Record<string, number>;
  work_style_scores: Record<string, number>;
  communication_scores: Record<string, number>;
  is_complete: boolean;
}

export interface ProjectRequirement {
  id: number;
  skill_name: string;
  min_proficiency: number;
  importance_weight: number;
  role_name?: string;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  project_type: string;
  target_team_size: number;
  duration_weeks: number;
  domain_category: string;
  experience_level_required: string;
  creator_id: number;
  created_at: string;
  requirements: ProjectRequirement[];
}

export interface FeatureContribution {
  feature_name: string;
  feature_label: string;
  shap_value: number;
  feature_value: number;
  direction: 'positive' | 'negative';
  human_explanation: string;
}

export interface SHAPExplanation {
  source_user_id: number;
  candidate_user_id: number;
  base_value: number;
  predicted_compatibility: number;
  top_positive_features: FeatureContribution[];
  top_negative_features: FeatureContribution[];
  all_contributions: FeatureContribution[];
}

export interface TeammateRecommendation {
  user_id: number;
  full_name: string;
  profession: string;
  experience_level: string;
  avatar_url?: string;
  overall_compatibility: number;
  technical_score: number;
  personality_score: number;
  work_style_score: number;
  communication_score: number;
  leadership_score: number;
  interest_score: number;
  conflict_risk: 'Low' | 'Medium' | 'High';
  conflict_risk_score: number;
  shared_skills: string[];
  complementary_skills: string[];
  recommended_role: string;
  role_reasoning: string;
  explanation_highlights: string[];
  shap_summary?: SHAPExplanation;
}

export interface TeamMember {
  user_id: number;
  full_name: string;
  profession: string;
  assigned_role: string;
  role_suitability_score: number;
  role_reasoning: string;
  skills: string[];
  avatar_url?: string;
}

export interface Team {
  id?: number;
  project_id: number;
  name: string;
  team_chemistry_score: number;
  skill_coverage_score: number;
  personality_balance_score: number;
  work_style_balance_score: number;
  communication_balance_score: number;
  leadership_balance_score: number;
  conflict_risk_score: number;
  conflict_risk_level: 'Low' | 'Medium' | 'High';
  members: TeamMember[];
  strengths: string[];
  risks: string[];
}

export interface RegressionMetrics {
  mae: number;
  rmse: number;
  r2_score: number;
}

export interface BaselineComparisonItem {
  model_name: string;
  description: string;
  mae: number;
  rmse: number;
  r2_score: number;
}

export interface AblationStageResult {
  stage_name: string;
  feature_subset: string;
  features_count: number;
  mae: number;
  rmse: number;
  r2_score: number;
}

export interface GlobalFeatureImportance {
  feature_name: string;
  feature_label: string;
  importance_score: number;
  category: string;
}

export interface MLStatus {
  is_trained: boolean;
  model_name: string;
  algorithm: string;
  version: string;
  trained_at?: string;
  dataset_size: number;
  features_count: number;
  test_metrics?: RegressionMetrics;
  baseline_comparison: BaselineComparisonItem[];
  ablation_study: AblationStageResult[];
  global_feature_importance: GlobalFeatureImportance[];
}

export interface AnalyticsOverview {
  total_users: number;
  total_projects: number;
  total_teams_generated: number;
  average_platform_compatibility: number;
  compatibility_distribution: { range: string; count: number }[];
  top_skills_distribution: { skill: string; count: number }[];
  conflict_risk_breakdown: { low: number; medium: number; high: number };
}
