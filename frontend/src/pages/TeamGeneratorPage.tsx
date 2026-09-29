import React, { useState, useEffect } from 'react';
import { projectApi, teamApi } from '../services/api';
import { Project, Team } from '../types';
import { TeamResultCard } from '../components/TeamResultCard';
import {
  Sparkles, Users, Sliders, Play, CheckCircle2,
  FolderKanban, AlertCircle, RefreshCw, BookmarkCheck,
  UserCheck, Layers
} from 'lucide-react';

interface TeamGeneratorPageProps {
  initialProject?: Project | null;
}

export const TeamGeneratorPage: React.FC<TeamGeneratorPageProps> = ({ initialProject }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number>(initialProject?.id || 1);
  const [teamSize, setTeamSize] = useState<number>(initialProject?.target_team_size || 4);
  const [focusPreference, setFocusPreference] = useState<string>('balanced');
  const [generatedTeams, setGeneratedTeams] = useState<Team[]>([]);
  const [acceptedTeams, setAcceptedTeams] = useState<Team[]>([]);
  const [activeTab, setActiveTab] = useState<'candidates' | 'accepted'>('candidates');
  const [loading, setLoading] = useState(false);
  const [loadingAccepted, setLoadingAccepted] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);

  const loadAcceptedTeams = async (projectId: number) => {
    setLoadingAccepted(true);
    try {
      const teams = await teamApi.getProjectTeams(projectId);
      setAcceptedTeams(teams);
    } catch (e) {
      console.error('Failed to load accepted teams:', e);
    } finally {
      setLoadingAccepted(false);
    }
  };

  useEffect(() => {
    projectApi.getAll().then((data) => {
      setProjects(data);
      if (data.length > 0 && !selectedProjectId) {
        setSelectedProjectId(data[0].id);
        setTeamSize(data[0].target_team_size);
        loadAcceptedTeams(data[0].id);
      } else if (selectedProjectId) {
        loadAcceptedTeams(selectedProjectId);
      }
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (initialProject) {
      setSelectedProjectId(initialProject.id);
      setTeamSize(initialProject.target_team_size);
      loadAcceptedTeams(initialProject.id);
    }
  }, [initialProject]);

  const handleProjectChange = (pid: number) => {
    setSelectedProjectId(pid);
    const p = projects.find((x) => x.id === pid);
    if (p) setTeamSize(p.target_team_size);
    loadAcceptedTeams(pid);
  };

  const handleGenerate = async () => {
    if (!selectedProjectId) return;
    setLoading(true);
    setSavedSuccess(null);
    setActiveTab('candidates');
    try {
      const teams = await teamApi.generate(selectedProjectId, teamSize, focusPreference);
      setGeneratedTeams(teams);
    } catch (e) {
      console.error('Team generation failed:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptTeam = async (team: Team) => {
    try {
      await teamApi.save(team);
      setSavedSuccess(`🎉 Successfully Accepted & Formed "${team.name}"! Member invites have been dispatched.`);
      await loadAcceptedTeams(selectedProjectId);
      setTimeout(() => setSavedSuccess(null), 6000);
    } catch (e) {
      console.error('Failed to accept team:', e);
    }
  };

  const currentProject = projects.find((p) => p.id === selectedProjectId);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Banner */}
      <div className="p-6 rounded-xl bg-surface border border-edge space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-accent-indigo text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" /> Combinatorial Beam Search Optimizer
        </div>
        <h1 className="text-2xl font-extrabold text-fg">Intelligent Team Generator Studio</h1>
        <p className="text-xs text-muted max-w-2xl">
          Construct and accept complementary candidate teams balancing required skill coverage, pairwise ML compatibility, psychological safety, leadership distribution, and minimal conflict risk.
        </p>
      </div>

      {/* Control Studio Card */}
      <div className="p-6 rounded-xl bg-surface border border-edge space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Project Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-fg/80 flex items-center gap-1.5">
              <FolderKanban className="w-4 h-4 text-accent-indigo" /> Target Project
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => handleProjectChange(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface2 border border-edge text-fg text-xs focus:outline-none focus:border-indigo-500"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.project_type})
                </option>
              ))}
            </select>
          </div>

          {/* Target Team Size Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-fg/80 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-accent-purple" /> Team Size
              </label>
              <span className="font-bold text-accent-indigo">{teamSize} Members</span>
            </div>
            <input
              type="range"
              min="2"
              max="6"
              value={teamSize}
              onChange={(e) => setTeamSize(parseInt(e.target.value))}
              className="w-full accent-indigo-500 mt-2"
            />
          </div>

          {/* Objective Focus */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-fg/80 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-accent-pink" /> Optimization Focus
            </label>
            <select
              value={focusPreference}
              onChange={(e) => setFocusPreference(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface2 border border-edge text-fg text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="balanced">Balanced Excellence (Recommended)</option>
              <option value="high_skill">Prioritize Deep Technical Coverage</option>
              <option value="high_chemistry">Prioritize Psychological Safety & Harmony</option>
            </select>
          </div>
        </div>

        {/* Requirements Pill Review */}
        {currentProject && (
          <div className="p-4 rounded-lg bg-surface2/60 border border-edge/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-muted">Required Skills: </span>
              <span className="text-fg font-medium">
                {currentProject.requirements.map((r) => r.skill_name).join(', ')}
              </span>
            </div>
            <span className="text-[11px] text-muted">
              Domain: <strong className="text-accent-indigo">{currentProject.domain_category}</strong>
            </span>
          </div>
        )}

        {/* Generate Action Button */}
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full py-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm transition flex items-center justify-center gap-2 active:scale-[0.99]"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Running Multi-Objective Beam Search Optimization...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              Synthesize Optimal Candidate Teams
            </>
          )}
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/40 text-accent-emerald text-xs font-semibold flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2">
          <BookmarkCheck className="w-5 h-5 text-accent-emerald shrink-0" />
          <span>{savedSuccess}</span>
        </div>
      )}

      {/* Tabs for Candidates vs Accepted Teams */}
      <div className="flex items-center gap-3 border-b border-edge pb-3">
        <button
          onClick={() => setActiveTab('candidates')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'candidates'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-surface2 text-muted hover:text-fg'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Generated Candidate Formations ({generatedTeams.length})
        </button>
        <button
          onClick={() => setActiveTab('accepted')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'accepted'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-surface2 text-muted hover:text-fg'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Accepted Project Rosters ({acceptedTeams.length})
        </button>
      </div>

      {/* Tab 1: Generated Candidate Formations */}
      {activeTab === 'candidates' && (
        <div className="space-y-6">
          {generatedTeams.length === 0 ? (
            <div className="p-12 text-center rounded-xl bg-surface border border-edge text-muted text-xs space-y-3">
              <Users className="w-8 h-8 text-subtle mx-auto" />
              <p className="font-semibold text-fg/80">No candidate formations generated yet.</p>
              <p className="text-subtle">Click &ldquo;Synthesize Optimal Candidate Teams&rdquo; above to run the beam search algorithm and view top recommended teams with the Accept button.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold text-fg flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent-indigo" />
                  Top {generatedTeams.length} Ranked Candidate Team Formations
                </h2>
                <span className="text-xs text-muted font-medium">Ranked by Multi-Objective Fitness</span>
              </div>

              <div className="space-y-6">
                {generatedTeams.map((team, idx) => (
                  <TeamResultCard
                    key={idx}
                    team={team}
                    onAccept={handleAcceptTeam}
                    onSave={handleAcceptTeam}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Accepted Project Rosters */}
      {activeTab === 'accepted' && (
        <div className="space-y-6">
          {loadingAccepted ? (
            <div className="text-center py-12 text-muted text-xs">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto text-emerald-500 mb-2" />
              Loading accepted teams...
            </div>
          ) : acceptedTeams.length === 0 ? (
            <div className="p-12 text-center rounded-xl bg-surface border border-edge text-muted text-xs space-y-3">
              <UserCheck className="w-8 h-8 text-subtle mx-auto" />
              <p className="font-semibold text-fg/80">No teams accepted yet for &ldquo;{currentProject?.title}&rdquo;.</p>
              <p className="text-subtle">Generate candidate teams and click the &ldquo;Accept &amp; Form Team&rdquo; button on any team card to form and lock the roster.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold text-fg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent-emerald" />
                  {acceptedTeams.length} Active Accepted Team{acceptedTeams.length > 1 ? 's' : ''} for {currentProject?.title}
                </h2>
                <span className="text-xs text-accent-emerald font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  Rosters Locked
                </span>
              </div>

              <div className="space-y-6">
                {acceptedTeams.map((team, idx) => (
                  <TeamResultCard
                    key={idx}
                    team={team}
                    saved={true}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

