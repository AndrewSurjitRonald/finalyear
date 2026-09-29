import React, { useState } from 'react';
import { Team } from '../types';
import {
  Sparkles, ShieldCheck, AlertTriangle, Users, Award,
  CheckCircle2, ArrowRight, Bookmark, Check, UserCheck,
  Send, Share2, Download, ExternalLink, X
} from 'lucide-react';
import { RadarChartComponent } from './RadarChart';

interface TeamResultCardProps {
  team: Team;
  onSave?: (team: Team) => Promise<void>;
  onAccept?: (team: Team) => Promise<void>;
  saved?: boolean;
}

export const TeamResultCard: React.FC<TeamResultCardProps> = ({
  team,
  onSave,
  onAccept,
  saved = false
}) => {
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(saved);
  const [showRadar, setShowRadar] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleAcceptTeam = async () => {
    setSaving(true);
    try {
      if (onAccept) {
        await onAccept(team);
      } else if (onSave) {
        await onSave(team);
      }
      setIsSaved(true);
      setShowAcceptModal(true);
    } catch (e) {
      console.error('Failed to accept team:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleCopySummary = () => {
    const summary = `${team.name} (Chemistry: ${Math.round(team.team_chemistry_score)}%)\nMembers:\n` +
      team.members.map((m) => `• ${m.full_name} — ${m.assigned_role} (${m.role_reasoning})`).join('\n');
    navigator.clipboard.writeText(summary);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const radarData = [
    { dimension: 'Skill Coverage', value: team.skill_coverage_score },
    { dimension: 'Personality', value: team.personality_balance_score },
    { dimension: 'Work Style', value: team.work_style_balance_score },
    { dimension: 'Communication', value: team.communication_balance_score },
    { dimension: 'Leadership', value: team.leadership_balance_score },
  ];

  return (
    <div className={`p-6 rounded-lg bg-surface border transition-all duration-300 space-y-6 ${
      isSaved ? 'border-emerald-500/50 ring-1 ring-emerald-500/20' : 'border-edge hover:border-edge2'
    }`}>
      {/* Team Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-edge">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-lg shadow-lg">
            {team.name.charAt(team.name.indexOf(' ') + 1 || 0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-fg">{team.name}</h3>
              {isSaved && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-accent-emerald border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Accepted & Formed
                </span>
              )}
            </div>
            <p className="text-xs text-muted">
              {team.members.length} Members Multi-Disciplinary Configuration
            </p>
          </div>
        </div>

        {/* Team Chemistry Score Badge */}
        <div className="flex items-center gap-3 bg-surface2/80 px-4 py-2 rounded-xl border border-edge">
          <div>
            <span className="text-[10px] text-muted uppercase font-bold tracking-wider block">Team Chemistry</span>
            <span className="text-2xl font-extrabold text-accent-indigo">{Math.round(team.team_chemistry_score)}%</span>
          </div>
          <div className="h-8 w-[1px] bg-surface3" />
          <div>
            <span className="text-[10px] text-muted uppercase font-bold tracking-wider block">Conflict Risk</span>
            <span className={`text-xs font-bold ${
              team.conflict_risk_level === 'Low' ? 'text-accent-emerald' : team.conflict_risk_level === 'Medium' ? 'text-accent-amber' : 'text-accent-rose'
            }`}>
              {team.conflict_risk_level} ({Math.round(team.conflict_risk_score)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Component Breakdown Bars */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
        <div className="p-2.5 rounded-xl bg-surface2/60 border border-edge/80">
          <span className="text-[11px] text-muted block mb-1">Skill Coverage</span>
          <span className="text-sm font-bold text-accent-indigo">{Math.round(team.skill_coverage_score)}%</span>
        </div>
        <div className="p-2.5 rounded-xl bg-surface2/60 border border-edge/80">
          <span className="text-[11px] text-muted block mb-1">Personality</span>
          <span className="text-sm font-bold text-accent-pink">{Math.round(team.personality_balance_score)}%</span>
        </div>
        <div className="p-2.5 rounded-xl bg-surface2/60 border border-edge/80">
          <span className="text-[11px] text-muted block mb-1">Work Style</span>
          <span className="text-sm font-bold text-accent-blue">{Math.round(team.work_style_balance_score)}%</span>
        </div>
        <div className="p-2.5 rounded-xl bg-surface2/60 border border-edge/80">
          <span className="text-[11px] text-muted block mb-1">Communication</span>
          <span className="text-sm font-bold text-accent-emerald">{Math.round(team.communication_balance_score)}%</span>
        </div>
        <div className="p-2.5 rounded-xl bg-surface2/60 border border-edge/80 col-span-2 sm:col-span-1">
          <span className="text-[11px] text-muted block mb-1">Leadership</span>
          <span className="text-sm font-bold text-accent-amber">{Math.round(team.leadership_balance_score)}%</span>
        </div>
      </div>

      {/* Team Members & Dynamic Role Allocations */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-fg/80 uppercase tracking-wider flex items-center gap-1.5">
          <Users className="w-4 h-4 text-accent-indigo" /> Member Composition & Explainable Roles
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {team.members.map((m, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-surface2/70 border border-edge/90 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-fg flex items-center gap-1.5">
                    {m.full_name}
                    {isSaved && <CheckCircle2 className="w-3.5 h-3.5 text-accent-emerald shrink-0" />}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/20 text-accent-indigo font-semibold border border-indigo-500/30">
                    {m.assigned_role}
                  </span>
                </div>
                <p className="text-[11px] text-muted mt-1 line-clamp-2">{m.role_reasoning}</p>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {m.skills.slice(0, 3).map((sk, i) => (
                  <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-surface3 text-fg/80">
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths & Potential Bottlenecks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
        <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-900/30 text-xs space-y-1.5">
          <span className="text-accent-emerald font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Team Strengths
          </span>
          {team.strengths.map((s, i) => (
            <p key={i} className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 leading-relaxed">• {s}</p>
          ))}
        </div>

        <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-900/30 text-xs space-y-1.5">
          <span className="text-accent-amber font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" /> Considerations & Alignment
          </span>
          {team.risks.map((r, i) => (
            <p key={i} className="text-[11px] text-amber-700/80 dark:text-amber-400/80 leading-relaxed">• {r}</p>
          ))}
        </div>
      </div>

      {/* Radar Chart Drawer Toggle */}
      {showRadar && (
        <div className="p-4 rounded-xl bg-surface2/90 border border-edge">
          <RadarChartComponent data={radarData} title="Team Chemistry Multi-Dimensional Radar" color="#818cf8" height={220} />
        </div>
      )}

      {/* Card Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-edge/80">
        <button
          onClick={() => setShowRadar(!showRadar)}
          className="text-xs font-medium text-muted hover:text-accent-indigo transition text-left"
        >
          {showRadar ? 'Hide Dynamic Radar' : 'View Dynamic Radar ↗'}
        </button>

        <div className="flex items-center gap-2">
          {/* Primary Accept Team Button */}
          <button
            onClick={handleAcceptTeam}
            disabled={saving || isSaved}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-200 shadow-lg ${
              isSaved
                ? 'bg-emerald-500/20 text-accent-emerald border border-emerald-500/40 cursor-default'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95'
            }`}
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Accepting & Forming Team...
              </>
            ) : isSaved ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-accent-emerald" />
                Team Accepted & Formed ✓
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4 text-fg" />
                Accept & Form Team
              </>
            )}
          </button>

          {isSaved && (
            <button
              onClick={() => setShowAcceptModal(true)}
              className="p-2.5 rounded-xl bg-surface3 hover:bg-edge2 text-fg/80 hover:text-fg transition"
              title="View Accepted Team Roster"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Acceptance Confirmation Modal */}
      {showAcceptModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface2 border border-emerald-500/40 rounded-xl max-w-xl w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between border-b border-edge pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-accent-emerald flex items-center justify-center border border-emerald-500/30">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-fg">Team Formation Confirmed!</h3>
                  <p className="text-xs text-muted">
                    <strong className="text-accent-emerald">{team.name}</strong> has been accepted and saved to the project roster.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAcceptModal(false)}
                className="p-1.5 rounded-lg bg-surface3 text-muted hover:text-fg text-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Roster & Invites Sent */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-fg/80 uppercase tracking-wider flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-accent-emerald" /> Collaboration Invitations Dispatched:
              </h4>
              <div className="space-y-2">
                {team.members.map((m, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-surface2/80 border border-edge">
                    <div>
                      <p className="text-xs font-bold text-fg">{m.full_name}</p>
                      <p className="text-[10px] text-accent-indigo font-medium">Assigned: {m.assigned_role}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-accent-emerald border border-emerald-500/20 text-[10px] font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Invite Sent
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-edge gap-3">
              <button
                onClick={handleCopySummary}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface3 hover:bg-edge2 text-fg/80 text-xs font-semibold transition"
              >
                <Share2 className="w-3.5 h-3.5" />
                {copiedLink ? 'Copied to Clipboard!' : 'Copy Team Summary'}
              </button>
              <button
                onClick={() => setShowAcceptModal(false)}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

