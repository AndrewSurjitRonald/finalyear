import React, { useState, useEffect } from 'react';
import { projectApi } from '../services/api';
import { Project } from '../types';
import {
  FolderKanban, Plus, Users, Calendar, Sparkles, Briefcase,
  Layers, ArrowRight, ShieldCheck, CheckCircle
} from 'lucide-react';

interface ProjectsPageProps {
  onSelectProjectForGeneration?: (project: Project) => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({ onSelectProjectForGeneration }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectType, setProjectType] = useState('Startup');
  const [targetTeamSize, setTargetTeamSize] = useState(4);
  const [durationWeeks, setDurationWeeks] = useState(8);
  const [domainCategory, setDomainCategory] = useState('AI/ML');
  const [experienceLevel, setExperienceLevel] = useState('Intermediate');
  const [requiredSkillsInput, setRequiredSkillsInput] = useState('Python, React, FastAPI, Machine Learning');
  const [creating, setCreating] = useState(false);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await projectApi.getAll();
      setProjects(data);
    } catch (e) {
      console.error('Failed to load projects:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    const skillsList = requiredSkillsInput.split(',').map((s) => s.trim()).filter(Boolean);
    const requirements = skillsList.map((sk) => ({
      skill_name: sk,
      min_proficiency: 3.5,
      importance_weight: 1.2,
      role_name: sk.includes('React') ? 'Frontend Specialist' : sk.includes('Python') || sk.includes('Learning') ? 'ML / AI Engineer' : 'Backend Architect',
    }));

    try {
      await projectApi.create({
        title,
        description,
        project_type: projectType,
        target_team_size: Number(targetTeamSize),
        duration_weeks: Number(durationWeeks),
        domain_category: domainCategory,
        experience_level_required: experienceLevel,
        requirements,
      });
      setShowCreateModal(false);
      setTitle('');
      setDescription('');
      await loadProjects();
    } catch (err) {
      console.error('Failed to create project:', err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-xl bg-surface border border-edge">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-accent-indigo text-xs font-semibold mb-2">
            <FolderKanban className="w-3.5 h-3.5" /> Collaboration Initiatives
          </div>
          <h1 className="text-2xl font-extrabold text-fg">Projects & Hackathons</h1>
          <p className="text-xs text-muted mt-1">
            Browse active collaboration initiatives or create a project to generate optimized candidate teams.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create New Project
        </button>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="text-center py-16 text-muted text-xs">Loading projects...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="p-6 rounded-xl bg-surface border border-edge hover:border-edge2 transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-accent-indigo font-semibold border border-indigo-500/20">
                      {proj.project_type}
                    </span>
                    <h3 className="text-base font-bold text-fg mt-1.5">{proj.title}</h3>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-surface3 text-muted font-medium">
                    {proj.domain_category}
                  </span>
                </div>

                <p className="text-xs text-muted leading-relaxed line-clamp-3">
                  {proj.description}
                </p>

                {/* Requirements List */}
                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] text-muted uppercase font-semibold tracking-wider block">
                    Required Technical Skills:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {proj.requirements.map((req) => (
                      <span
                        key={req.id}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-surface2 border border-edge2/80 text-fg/80 font-medium"
                      >
                        {req.skill_name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Project Metadata & Actions */}
              <div className="pt-4 border-t border-edge/80 flex items-center justify-between text-xs text-muted">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-accent-indigo" /> {proj.target_team_size} Members
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-accent-purple" /> {proj.duration_weeks} Weeks
                  </span>
                </div>

                {onSelectProjectForGeneration && (
                  <button
                    onClick={() => onSelectProjectForGeneration(proj)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-accent-indigo hover:text-white border border-indigo-500/30 text-xs font-semibold transition"
                  >
                    Generate Team <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Project Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface2 border border-edge2 rounded-xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-edge pb-3">
              <h3 className="text-base font-bold text-fg">Create New Collaboration Project</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg bg-surface3 text-muted hover:text-fg text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-fg/80">Project Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI-Powered Medical Diagnostics Copilot"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-surface2 border border-edge text-fg text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-fg/80">Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe project objectives, technical scope, and key deliverables..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-surface2 border border-edge text-fg text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-fg/80">Project Type</label>
                  <select
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface2 border border-edge text-fg text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Startup">Startup</option>
                    <option value="Hackathon">Hackathon</option>
                    <option value="College Project">College Project</option>
                    <option value="Research">Research</option>
                    <option value="Open Source">Open Source</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-fg/80">Domain Category</label>
                  <input
                    type="text"
                    value={domainCategory}
                    onChange={(e) => setDomainCategory(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-surface2 border border-edge text-fg text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-fg/80">Target Team Size</label>
                  <input
                    type="number"
                    min="2"
                    max="8"
                    value={targetTeamSize}
                    onChange={(e) => setTargetTeamSize(parseInt(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-surface2 border border-edge text-fg text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-fg/80">Duration (Weeks)</label>
                  <input
                    type="number"
                    min="1"
                    max="52"
                    value={durationWeeks}
                    onChange={(e) => setDurationWeeks(parseInt(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-surface2 border border-edge text-fg text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-fg/80">Required Skills (Comma Separated)</label>
                <input
                  type="text"
                  required
                  value={requiredSkillsInput}
                  onChange={(e) => setRequiredSkillsInput(e.target.value)}
                  placeholder="Python, PyTorch, React, UI/UX Design, FastAPI"
                  className="w-full px-3.5 py-2 rounded-xl bg-surface2 border border-edge text-fg text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-surface3 text-fg/80 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md"
                >
                  {creating ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
