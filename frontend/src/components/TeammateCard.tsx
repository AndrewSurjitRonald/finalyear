import React, { useState } from 'react';
import { TeammateRecommendation } from '../types';
import {
  Sparkles, CheckCircle2, AlertTriangle, ShieldCheck,
  ChevronRight, BrainCircuit, Code, Users, Briefcase,
  UserCheck, Send, Check
} from 'lucide-react';
import { SHAPWaterfallChart } from './SHAPWaterfallChart';

interface TeammateCardProps {
  teammate: TeammateRecommendation;
  onSelect?: (teammate: TeammateRecommendation) => void;
  selected?: boolean;
}

export const TeammateCard: React.FC<TeammateCardProps> = ({
  teammate,
  onSelect,
  selected = false
}) => {
  const [showShapModal, setShowShapModal] = useState(false);
  const [invited, setInvited] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-accent-emerald';
    if (score >= 70) return 'text-accent-indigo';
    if (score >= 50) return 'text-accent-amber';
    return 'text-accent-rose';
  };

  const getConflictBadge = (level: string) => {
    switch (level) {
      case 'Low':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-accent-emerald border border-emerald-500/30 flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Low Risk</span>;
      case 'Medium':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-accent-amber border border-amber-500/30 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Moderate Risk</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-accent-rose border border-rose-500/30 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> High Risk</span>;
    }
  };

  const handleInvite = () => {
    setInvited(true);
  };

  return (
    <div className={`p-5 rounded-lg bg-surface border transition-all duration-300 flex flex-col justify-between ${
      selected ? 'border-indigo-500 ring-2 ring-indigo-500/30' : 'border-edge hover:border-edge2'
    }`}>
      <div className="space-y-4">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-md">
              {teammate.full_name.charAt(0)}
            </div>
            <div>
              <h3 className="text-sm font-bold text-fg group-hover:text-accent-indigo transition">
                {teammate.full_name}
              </h3>
              <p className="text-xs text-muted">{teammate.profession}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] px-2 py-0.5 rounded bg-surface3 text-fg/80 font-medium">
                  {teammate.experience_level}
                </span>
                {getConflictBadge(teammate.conflict_risk)}
              </div>
            </div>
          </div>

          {/* Compatibility Badge */}
          <div className="text-right">
            <div className="inline-flex flex-col items-end">
              <span className="text-[10px] text-muted uppercase font-bold tracking-wider">Fit</span>
              <div className="flex items-baseline gap-0.5">
                <span className={`text-2xl font-extrabold ${getScoreColor(teammate.overall_compatibility)}`}>
                  {Math.round(teammate.overall_compatibility)}
                </span>
                <span className="text-xs text-muted font-bold">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Sub-score Breakdown */}
        <div className="space-y-1.5 pt-1">
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-surface2/60 border border-edge/60">
              <span className="text-muted">Technical</span>
              <span className="font-semibold text-accent-indigo">{Math.round(teammate.technical_score)}%</span>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-surface2/60 border border-edge/60">
              <span className="text-muted">Personality</span>
              <span className="font-semibold text-accent-pink">{Math.round(teammate.personality_score)}%</span>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-surface2/60 border border-edge/60">
              <span className="text-muted">Work Style</span>
              <span className="font-semibold text-accent-blue">{Math.round(teammate.work_style_score)}%</span>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-surface2/60 border border-edge/60">
              <span className="text-muted">Communication</span>
              <span className="font-semibold text-accent-emerald">{Math.round(teammate.communication_score)}%</span>
            </div>
          </div>
        </div>

        {/* Recommended Role */}
        <div className="p-2.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs">
          <div className="flex items-center gap-1.5 text-accent-indigo font-semibold mb-1">
            <Briefcase className="w-3.5 h-3.5" /> Best Role: {teammate.recommended_role}
          </div>
          <p className="text-[11px] text-muted leading-snug">{teammate.role_reasoning}</p>
        </div>

        {/* Complementary & Shared Skills */}
        <div className="space-y-1.5">
          {teammate.complementary_skills.length > 0 && (
            <div>
              <span className="text-[10px] text-accent-emerald font-semibold uppercase tracking-wider block mb-1">
                Complementary Additions:
              </span>
              <div className="flex flex-wrap gap-1">
                {teammate.complementary_skills.map((s, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-accent-emerald border border-emerald-500/20 font-medium">
                    +{s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* XAI Recommendation Highlights */}
        <div className="space-y-1 pt-1 border-t border-edge/80">
          <span className="text-[10px] text-muted uppercase font-semibold tracking-wider block">
            AI Recommendation Rationale:
          </span>
          {teammate.explanation_highlights.map((h, i) => (
            <div key={i} className="flex items-start gap-1.5 text-xs text-fg/80">
              <CheckCircle2 className="w-3.5 h-3.5 text-accent-indigo mt-0.5 shrink-0" />
              <span className="text-[11px]">{h}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Card Actions */}
      <div className="pt-4 mt-4 border-t border-edge flex items-center justify-between gap-2">
        <button
          onClick={() => setShowShapModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface3 hover:bg-edge2 text-xs font-medium text-fg transition"
        >
          <BrainCircuit className="w-3.5 h-3.5 text-accent-indigo" />
          SHAP Analysis
        </button>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleInvite}
            disabled={invited}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              invited
                ? 'bg-emerald-500/20 text-accent-emerald border border-emerald-500/30 cursor-default'
                : 'bg-surface3 hover:bg-emerald-600/80 text-fg/80 hover:text-white'
            }`}
          >
            {invited ? (
              <>
                <Check className="w-3.5 h-3.5 text-accent-emerald" />
                Invited
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                Invite
              </>
            )}
          </button>

          {onSelect && (
            <button
              onClick={() => onSelect(teammate)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selected
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-surface3/80 hover:bg-indigo-600 text-white hover:text-white'
              }`}
            >
              {selected ? 'Added ✓' : '+ Roster'}
            </button>
          )}
        </div>
      </div>

      {/* Local SHAP Modal */}
      {showShapModal && teammate.shap_summary && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface2 border border-edge2 rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-fg">Explainable AI Analysis</h3>
                <p className="text-xs text-muted">Deep local SHAP TreeExplainer breakdown for {teammate.full_name}</p>
              </div>
              <button
                onClick={() => setShowShapModal(false)}
                className="p-1.5 rounded-lg bg-surface3 text-muted hover:text-fg text-xs"
              >
                ✕ Close
              </button>
            </div>

            <SHAPWaterfallChart
              contributions={teammate.shap_summary.all_contributions}
              baseValue={teammate.shap_summary.base_value}
              predictedScore={teammate.shap_summary.predicted_compatibility}
              candidateName={teammate.full_name}
            />
          </div>
        </div>
      )}
    </div>
  );
};

