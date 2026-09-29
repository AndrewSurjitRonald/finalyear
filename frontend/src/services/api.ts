import axios from 'axios';
import {
  User, Profile, QuestionnaireItem, DimensionScore, AssessmentSummary,
  Project, TeammateRecommendation, Team, SHAPExplanation, MLStatus,
  AnalyticsOverview, UserSkill
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('cofound_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const res = await apiClient.post<{ access_token: string; token_type: string; user_id: number; email: string }>('/auth/login', { email, password });
    localStorage.setItem('cofound_token', res.data.access_token);
    return res.data;
  },
  register: async (email: string, password: string, fullName: string, profession?: string, education?: string) => {
    const res = await apiClient.post<{ access_token: string; token_type: string; user_id: number; email: string }>('/auth/register', {
      email,
      password,
      full_name: fullName,
      profession,
      education,
    });
    localStorage.setItem('cofound_token', res.data.access_token);
    return res.data;
  },
  getMe: async (): Promise<User> => {
    const res = await apiClient.get<User>('/auth/me');
    return res.data;
  },
  logout: () => {
    localStorage.removeItem('cofound_token');
  }
};

// Users & Profile API
export const userApi = {
  updateProfile: async (data: Partial<Profile>): Promise<Profile> => {
    const res = await apiClient.put<Profile>('/users/profile', data);
    return res.data;
  },
  addSkill: async (skillName: string, proficiency: number, yearsExperience: number): Promise<UserSkill> => {
    const res = await apiClient.post<UserSkill>('/users/skills', {
      skill_name: skillName,
      proficiency,
      years_experience: yearsExperience
    });
    return res.data;
  },
  removeSkill: async (userSkillId: number) => {
    await apiClient.delete(`/users/skills/${userSkillId}`);
  },
  addInterest: async (interestTag: string, category?: string) => {
    const res = await apiClient.post('/users/interests', { interest_tag: interestTag, category });
    return res.data;
  },
  removeInterest: async (interestId: number) => {
    await apiClient.delete(`/users/interests/${interestId}`);
  }
};

// Skills Catalog API
export const skillsApi = {
  getAll: async () => {
    const res = await apiClient.get<Array<{ id: number; name: string; category: string }>>('/skills/');
    return res.data;
  }
};

// Questionnaire & Assessments API
export const assessmentApi = {
  getItems: async (category: 'personality' | 'work_style' | 'communication'): Promise<QuestionnaireItem[]> => {
    const res = await apiClient.get<QuestionnaireItem[]>(`/questionnaire/items/${category}`);
    return res.data;
  },
  submit: async (category: string, responses: Array<{ item_id: number; response_value: number }>): Promise<DimensionScore[]> => {
    const res = await apiClient.post<DimensionScore[]>('/questionnaire/submit', { category, responses });
    return res.data;
  },
  getSummary: async (): Promise<AssessmentSummary> => {
    const res = await apiClient.get<AssessmentSummary>('/questionnaire/summary');
    return res.data;
  }
};

// Projects API
export const projectApi = {
  getAll: async (): Promise<Project[]> => {
    const res = await apiClient.get<Project[]>('/projects/');
    return res.data;
  },
  getById: async (id: number): Promise<Project> => {
    const res = await apiClient.get<Project>(`/projects/${id}`);
    return res.data;
  },
  create: async (data: {
    title: string;
    description: string;
    project_type: string;
    target_team_size: number;
    duration_weeks: number;
    domain_category: string;
    experience_level_required: string;
    requirements: Array<{ skill_name: string; min_proficiency: number; importance_weight: number; role_name?: string }>;
  }): Promise<Project> => {
    const res = await apiClient.post<Project>('/projects/', data);
    return res.data;
  }
};

// Recommendations & SHAP API
export const recommendationApi = {
  getTeammates: async (projectId?: number, limit = 20): Promise<TeammateRecommendation[]> => {
    const params = new URLSearchParams();
    if (projectId) params.append('project_id', projectId.toString());
    params.append('limit', limit.toString());
    const res = await apiClient.get<TeammateRecommendation[]>(`/recommendations/teammates?${params.toString()}`);
    return res.data;
  },
  getExplanation: async (candidateUserId: number, projectId?: number): Promise<SHAPExplanation> => {
    const params = new URLSearchParams();
    if (projectId) params.append('project_id', projectId.toString());
    const res = await apiClient.get<SHAPExplanation>(`/recommendations/explain/${candidateUserId}?${params.toString()}`);
    return res.data;
  }
};

// Teams API
export const teamApi = {
  generate: async (projectId: number, teamSize?: number, focusPreference = 'balanced'): Promise<Team[]> => {
    const res = await apiClient.post<Team[]>('/teams/generate', {
      project_id: projectId,
      team_size: teamSize,
      focus_preference: focusPreference
    });
    return res.data;
  },
  save: async (team: Team): Promise<Team> => {
    const res = await apiClient.post<Team>('/teams/save', team);
    return res.data;
  },
  getProjectTeams: async (projectId: number): Promise<Team[]> => {
    const res = await apiClient.get<Team[]>(`/teams/project/${projectId}`);
    return res.data;
  }
};

// ML & Research API
export const mlApi = {
  getStatus: async (): Promise<MLStatus> => {
    const res = await apiClient.get<MLStatus>('/ml/status');
    return res.data;
  },
  retrain: async () => {
    const res = await apiClient.post('/ml/train');
    return res.data;
  }
};

// Analytics API
export const analyticsApi = {
  getOverview: async (): Promise<AnalyticsOverview> => {
    const res = await apiClient.get<AnalyticsOverview>('/analytics/overview');
    return res.data;
  }
};

export default apiClient;
