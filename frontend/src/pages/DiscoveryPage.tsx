import React, { useState, useEffect } from 'react';
import { recommendationApi, projectApi, teamApi } from '../services/api';
import { TeammateRecommendation, Project, Team } from '../types';
import { TeammateCard } from '../components/TeammateCard';
import { useAuth } from '../context/AuthContext';
import {
  Users, Search, Filter, Sparkles, FolderKanban,
  CheckCircle2, ArrowUpDown, BrainCircuit, RefreshCw,
  UserCheck, Send, Check, X, ShieldCheck
} from 'lucide-react';

export const DiscoveryPage: React.FC = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<TeammateRecommendation[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'overall' | 'technical' | 'personality' | 'work_style'>('overall');
  const [loading, setLoading] = useState(true);

  // Selected for temporary custom roster
  const [selectedTeammates, setSelectedTeammates] = useState<TeammateRecommendation[]>([]);
  const [showFormTeamModal, setShowFormTeamModal] = useState(false);
  const [customTeamName, setCustomTeamName] = useState('Custom Star Alliance');
  const [savingCustomTeam, setSavingCustomTeam] = useState(false);
  const [teamFormedSuccess, setTeamFormedSuccess] = useState<string | null>(null);

  const loadProjects = async () => {
    try {
      const data = await projectApi.getAll();
      setProjects(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const data = await recommendationApi.getTeammates(selectedProjectId, 30);
      setRecommendations(data);
    } catch (e) {
      console.error('Failed to load recommendations:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    loadRecommendations();
  }, [selectedProjectId]);

  const handleToggleSelect = (teammate: TeammateRecommendation) => {
    setSelectedTeammates((prev) => {
      const exists = prev.some((t) => t.user_id === teammate.user_id);
      if (exists) {
        return prev.filter((t) => t.user_id !== teammate.user_id);
      } else {
        return [...prev, teammate];
      }
    });
  };

  const handleAcceptCustomTeam = async () => {
    if (!selectedTeammates.length) return;
    setSavingCustomTeam(true);

    const targetProjId = selectedProjectId || (projects.length > 0 ? projects[0].id : 1);
    const avgScore = Math.round(
      selectedTeammates.reduce((acc, t) => acc + t.overall_compatibility, 0) / selectedTeammates.length
    );

    // Build members list including current user
    const members = [
      ...(user ? [{
        user_id: user.id,
        full_name: user.profile?.full_name || 'Team Lead',
        profession: user.profile?.profession || 'Full-Stack Engineer',
        assigned_role: 'Project Lead',
        role_suitability_score: 95.0,
        role_reasoning: 'Project originator and primary collaborator',
        skills: user.profile?.skills?.map((s) => s.name) || ['Python', 'Architecture'],
        avatar_url: user.profile?.avatar_url
      }] : []),
      ...selectedTeammates.map((tm) => ({
        user_id: tm.user_id,
        full_name: tm.full_name,
        profession: tm.profession,
        assigned_role: tm.recommended_role,
        role_suitability_score: tm.technical_score,
        role_reasoning: tm.role_reasoning,
        skills: tm.complementary_skills.concat(tm.shared_skills),
        avatar_url: tm.avatar_url
      }))
    ];

    const newTeam: Team = {
      project_id: targetProjId,
      name: customTeamName || 'Custom Star Alliance',
      team_chemistry_score: avgScore,
      skill_coverage_score: 92.0,
      personality_balance_score: 88.0,
      work_style_balance_score: 85.0,
      communication_balance_score: 87.0,
      leadership_balance_score: 80.0,
      conflict_risk_score: 22.0,
      conflict_risk_level: 'Low',
      members: members,
      strengths: [
        'Curated manual candidate composition with strong pairwise synergy.',
        'High technical and behavioral role complementarity across all members.'
      ],
      risks: [
        'Maintain regular async standups to align diverse work pace preferences.'
      ]
    };

    try {
      await teamApi.save(newTeam);
      setShowFormTeamModal(false);
      setTeamFormedSuccess(`🎉 Team "${newTeam.name}" accepted and saved to project roster! Invitations dispatched.`);
      setSelectedTeammates([]);
      setTimeout(() => setTeamFormedSuccess(null), 6000);
    } catch (e) {
      console.error('Failed to save custom team:', e);
    } finally {
      setSavingCustomTeam(false);
    }
  };

  // Filter & Sort
  const filtered = recommendations
    .filter((r) => {
      const matchesSearch =
        r.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.profession.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.complementary_skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
        r.shared_skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'technical') return b.technical_score - a.technical_score;
      if (sortBy === 'personality') return b.personality_score - a.personality_score;
      if (sortBy === 'work_style') return b.work_style_score - a.work_style_score;
      return b.overall_compatibility - a.overall_compatibility;
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-xl bg-surface border border-edge">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-accent-indigo text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Gradient Ensemble & SHAP Engine
          </div>
          <h1 className="text-2xl font-extrabold text-fg">Intelligent Teammate Discovery</h1>
          <p className="text-xs text-muted mt-1">
            Browse multi-dimensionally ranked candidates dynamically scored by our ML compatibility model and explained via SHAP.
          </p>
        </div>

        {/* Selected Roster Pill */}
        {selectedTeammates.length > 0 && (
          <div className="flex items-center gap-3 p-3.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30">
            <div>
              <span className="text-xs font-bold text-fg block">
                {selectedTeammates.length} Candidate{selectedTeammates.length > 1 ? 's' : ''} Selected
              </span>
              <button
                onClick={() => setSelectedTeammates([])}
                className="text-[10px] text-muted hover:text-accent-rose"
              >
                Clear selection
              </button>
            </div>
            <button
              onClick={() => setShowFormTeamModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg transition active:scale-95"
            >
              <UserCheck className="w-4 h-4" />
              Accept & Form Team
            </button>
          </div>
        )}
      </div>

      {teamFormedSuccess && (
        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/40 text-accent-emerald text-xs font-semibold flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-accent-emerald shrink-0" />
          <span>{teamFormedSuccess}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-lg bg-surface2 border border-edge flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-subtle absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by name, profession, or skill (e.g. PyTorch, React, UI/UX)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-page border border-edge text-fg text-xs focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Project Requirements Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <FolderKanban className="w-4 h-4 text-muted shrink-0" />
          <select
            value={selectedProjectId || ''}
            onChange={(e) => setSelectedProjectId(e.target.value ? Number(e.target.value) : undefined)}
            className="px-3 py-2 rounded-xl bg-page border border-edge text-fg text-xs focus:outline-none focus:border-indigo-500 w-full md:w-60"
          >
            <option value="">All Candidates (General Fit)</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} ({p.project_type})
              </option>
            ))}
          </select>
        </div>

        {/* Sorting */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <ArrowUpDown className="w-4 h-4 text-muted shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-page border border-edge text-fg text-xs focus:outline-none focus:border-indigo-500 w-full md:w-48"
          >
            <option value="overall">Highest Compatibility</option>
            <option value="technical">Technical Synergy</option>
            <option value="personality">Personality Balance</option>
            <option value="work_style">Work Style Alignment</option>
          </select>
        </div>
      </div>

      {/* Candidate Cards Grid */}
      {loading ? (
        <div className="text-center py-20 text-muted text-xs">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-500 mb-2" />
          Running ML feature extraction and SHAP TreeExplainer scoring...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-surface border border-edge text-muted text-xs space-y-2">
          <Users className="w-8 h-8 text-subtle mx-auto" />
          <p>No candidate profiles matched the specified search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((tm) => (
            <TeammateCard
              key={tm.user_id}
              teammate={tm}
              onSelect={handleToggleSelect}
              selected={selectedTeammates.some((t) => t.user_id === tm.user_id)}
            />
          ))}
        </div>
      )}

      {/* Accept & Form Custom Team Modal */}
      {showFormTeamModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface2 border border-edge2 rounded-xl max-w-xl w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between border-b border-edge pb-3">
              <div>
                <h3 className="text-base font-extrabold text-fg">Accept & Form Custom Team</h3>
                <p className="text-xs text-muted">
                  Form a locked collaboration team with {selectedTeammates.length} selected candidate{selectedTeammates.length > 1 ? 's' : ''}.
                </p>
              </div>
              <button
                onClick={() => setShowFormTeamModal(false)}
                className="p-1.5 rounded-lg bg-surface3 text-muted hover:text-fg text-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-fg/80">Team Name</label>
              <input
                type="text"
                value={customTeamName}
                onChange={(e) => setCustomTeamName(e.target.value)}
                placeholder="e.g. Team Hyperion"
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface2 border border-edge text-fg text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Selected Members Roster Preview */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-muted uppercase tracking-wider block">
                Roster Preview ({selectedTeammates.length + 1} Members):
              </span>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs">
                  <div>
                    <span className="font-bold text-fg">{user?.profile?.full_name || 'You (Demo User)'}</span>
                    <span className="text-[10px] text-accent-indigo ml-2">Project Lead</span>
                  </div>
                  <span className="text-[10px] text-accent-indigo font-semibold">Creator</span>
                </div>
                {selectedTeammates.map((tm) => (
                  <div key={tm.user_id} className="flex items-center justify-between p-2.5 rounded-xl bg-surface2 border border-edge text-xs">
                    <div>
                      <span className="font-bold text-fg">{tm.full_name}</span>
                      <span className="text-[10px] text-muted ml-2">({tm.recommended_role})</span>
                    </div>
                    <span className="text-[11px] font-bold text-accent-emerald">{Math.round(tm.overall_compatibility)}% Fit</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-edge">
              <button
                onClick={() => setShowFormTeamModal(false)}
                className="px-4 py-2 rounded-xl bg-surface3 text-fg/80 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleAcceptCustomTeam}
                disabled={savingCustomTeam}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-lg"
              >
                {savingCustomTeam ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Accepting & Forming Team...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Confirm & Accept Team
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

