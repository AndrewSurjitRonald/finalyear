import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userApi, assessmentApi, skillsApi } from '../services/api';
import { AssessmentSummary } from '../types';
import {
  User, Sparkles, Plus, Trash2, ShieldCheck, Briefcase,
  GraduationCap, Award, BrainCircuit, Sliders, Check
} from 'lucide-react';
import { RadarChartComponent } from '../components/RadarChart';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [skillsCatalog, setSkillsCatalog] = useState<Array<{ id: number; name: string }>>([]);
  const [assessmentSummary, setAssessmentSummary] = useState<AssessmentSummary | null>(null);

  // Skill Add State
  const [newSkillName, setNewSkillName] = useState('');
  const [newProficiency, setNewProficiency] = useState(3.5);
  const [newExperience, setNewExperience] = useState(2.0);
  const [addingSkill, setAddingSkill] = useState(false);

  // Interest Add State
  const [newInterest, setNewInterest] = useState('');

  // Profile Edit State
  const [fullName, setFullName] = useState(user?.profile?.full_name || '');
  const [profession, setProfession] = useState(user?.profile?.profession || '');
  const [education, setEducation] = useState(user?.profile?.education || '');
  const [bio, setBio] = useState(user?.profile?.bio || '');
  const [leadershipTendency, setLeadershipTendency] = useState(user?.profile?.leadership_tendency || 0.5);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    if (user?.profile) {
      setFullName(user.profile.full_name);
      setProfession(user.profile.profession || '');
      setEducation(user.profile.education || '');
      setBio(user.profile.bio || '');
      setLeadershipTendency(user.profile.leadership_tendency || 0.5);
    }
  }, [user]);

  useEffect(() => {
    skillsApi.getAll().then(setSkillsCatalog).catch(console.error);
    assessmentApi.getSummary().then(setAssessmentSummary).catch(console.error);
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setSavedNotice(false);
    try {
      await userApi.updateProfile({
        full_name: fullName,
        profession,
        education,
        bio,
        leadership_tendency: Number(leadershipTendency),
      });
      await refreshUser();
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    setAddingSkill(true);
    try {
      await userApi.addSkill(newSkillName.trim(), Number(newProficiency), Number(newExperience));
      setNewSkillName('');
      await refreshUser();
    } catch (err) {
      console.error('Failed to add skill:', err);
    } finally {
      setAddingSkill(false);
    }
  };

  const handleRemoveSkill = async (id: number) => {
    try {
      await userApi.removeSkill(id);
      await refreshUser();
    } catch (err) {
      console.error('Failed to remove skill:', err);
    }
  };

  const handleAddInterest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInterest.trim()) return;
    try {
      await userApi.addInterest(newInterest.trim(), 'Domain');
      setNewInterest('');
      await refreshUser();
    } catch (err) {
      console.error('Failed to add interest:', err);
    }
  };

  const handleRemoveInterest = async (id: number) => {
    try {
      await userApi.removeInterest(id);
      await refreshUser();
    } catch (err) {
      console.error('Failed to remove interest:', err);
    }
  };

  // Radar data
  const personalityData = assessmentSummary?.personality_scores
    ? Object.entries(assessmentSummary.personality_scores).map(([k, v]) => ({
        dimension: k.charAt(0).toUpperCase() + k.slice(1).replace('_', ' '),
        value: Math.round(v * 100),
      }))
    : [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-xl bg-surface border border-edge">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-extrabold text-2xl">
            {fullName ? fullName.charAt(0) : 'U'}
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-fg">{fullName || user?.email}</h1>
            <p className="text-xs text-muted">{profession || 'Software Engineer'}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-accent-indigo font-semibold border border-indigo-500/30">
                {user?.profile?.experience_level || 'Intermediate'} Level
              </span>
              <span className="text-[10px] text-muted">{user?.email}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {savedNotice && (
            <span className="text-xs text-accent-emerald flex items-center gap-1 font-semibold">
              <Check className="w-4 h-4" /> Profile Updated
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Edit Details & Skills */}
        <div className="lg:col-span-2 space-y-8">
          {/* Profile Details Form */}
          <div className="p-6 rounded-xl bg-surface border border-edge space-y-6">
            <h2 className="text-sm font-bold text-fg uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-accent-indigo" /> Basic Information & Attributes
            </h2>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-fg/80">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-surface2 border border-edge text-fg text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-fg/80">Profession / Title</label>
                  <input
                    type="text"
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-surface2 border border-edge text-fg text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-fg/80">Education</label>
                  <input
                    type="text"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-surface2 border border-edge text-fg text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-fg/80">
                    Leadership Drive Preference ({Math.round(leadershipTendency * 100)}%)
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="0.95"
                    step="0.05"
                    value={leadershipTendency}
                    onChange={(e) => setLeadershipTendency(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 mt-2"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-fg/80">Bio & Collaboration Style</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-surface2 border border-edge text-fg text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition"
              >
                {savingProfile ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>

          {/* Technical Skills Inventory */}
          <div className="p-6 rounded-xl bg-surface border border-edge space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-fg uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-accent-indigo" /> Technical Skills & Proficiencies
              </h2>
              <span className="text-xs text-muted">
                {user?.profile?.skills?.length || 0} Skills Configured
              </span>
            </div>

            {/* Existing Skills Tags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {user?.profile?.skills?.map((sk) => (
                <div
                  key={sk.id}
                  className="p-3 rounded-xl bg-surface2/80 border border-edge flex items-center justify-between gap-2"
                >
                  <div>
                    <span className="text-xs font-bold text-fg">{sk.name}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-accent-indigo font-medium">
                        Proficiency: {sk.proficiency}/5.0
                      </span>
                      <span className="text-[10px] text-subtle">•</span>
                      <span className="text-[10px] text-muted">{sk.years_experience}y exp</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveSkill(sk.id)}
                    className="p-1.5 rounded-lg text-subtle hover:text-accent-rose hover:bg-rose-500/10 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Skill Form */}
            <form onSubmit={handleAddSkill} className="p-4 rounded-lg bg-surface2/60 border border-edge/80 space-y-3">
              <span className="text-xs font-bold text-fg/80 block">Add Technical Skill</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PyTorch, React, Go"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface2 border border-edge2 text-fg text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted block mb-1">
                    Proficiency: {newProficiency} / 5.0
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.5"
                    value={newProficiency}
                    onChange={(e) => setNewProficiency(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={addingSkill}
                    className="w-full py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Add Skill
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Interests & Domains */}
          <div className="p-6 rounded-xl bg-surface border border-edge space-y-4">
            <h2 className="text-sm font-bold text-fg uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent-purple" /> Domain & Project Interests
            </h2>

            <div className="flex flex-wrap gap-2">
              {user?.profile?.interests?.map((it) => (
                <span
                  key={it.id}
                  className="px-3 py-1 rounded-xl bg-purple-500/10 border border-purple-500/30 text-accent-purple text-xs font-medium flex items-center gap-2"
                >
                  {it.interest_tag}
                  <button
                    onClick={() => handleRemoveInterest(it.id)}
                    className="text-accent-purple hover:text-accent-rose"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <form onSubmit={handleAddInterest} className="flex items-center gap-2 pt-2">
              <input
                type="text"
                placeholder="e.g. Healthcare AI, Autonomous Systems, FinTech"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl bg-surface2 border border-edge text-fg text-xs focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition"
              >
                Add Interest
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Psychometric Vectors Summary */}
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-surface border border-edge space-y-4">
            <h3 className="text-xs font-bold text-fg uppercase tracking-wider flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-accent-indigo" /> Big Five Radar Vector
            </h3>

            {personalityData.length > 0 ? (
              <RadarChartComponent data={personalityData} height={250} />
            ) : (
              <p className="text-xs text-subtle text-center py-8">
                Take the assessment to compute Big Five vectors.
              </p>
            )}

            {/* Work Style Breakdown */}
            {assessmentSummary?.work_style_scores && (
              <div className="space-y-2 pt-4 border-t border-edge">
                <span className="text-[11px] font-bold text-fg/80 uppercase tracking-wider block">
                  Work Style Preferences:
                </span>
                {Object.entries(assessmentSummary.work_style_scores).map(([k, v]) => (
                  <div key={k} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-fg/80">
                      <span className="capitalize">{k.replace('_', ' ')}</span>
                      <span className="font-mono text-accent-indigo">{Math.round(v * 100)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface3 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500"
                        style={{ width: `${Math.round(v * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
