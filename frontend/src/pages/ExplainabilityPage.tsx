import React, { useState, useEffect } from 'react';
import { mlApi, recommendationApi, projectApi } from '../services/api';
import { MLStatus, TeammateRecommendation, Project, SHAPExplanation } from '../types';
import { FeatureImportanceChart } from '../components/FeatureImportanceChart';
import { SHAPWaterfallChart } from '../components/SHAPWaterfallChart';
import {
  BrainCircuit, Sparkles, BookOpen, Layers, Users,
  CheckCircle2, ArrowRight, RefreshCw, Info
} from 'lucide-react';

export const ExplainabilityPage: React.FC = () => {
  const [mlStatus, setMlStatus] = useState<MLStatus | null>(null);
  const [candidates, setCandidates] = useState<TeammateRecommendation[]>([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(null);
  const [explanation, setExplanation] = useState<SHAPExplanation | null>(null);
  const [loadingExpl, setLoadingExpl] = useState(false);

  useEffect(() => {
    mlApi.getStatus().then(setMlStatus).catch(console.error);
    recommendationApi.getTeammates(undefined, 20).then((data) => {
      setCandidates(data);
      if (data.length > 0) {
        setSelectedCandidateId(data[0].user_id);
        setExplanation(data[0].shap_summary || null);
      }
    }).catch(console.error);
  }, []);

  const handleSelectCandidate = async (candId: number) => {
    setSelectedCandidateId(candId);
    setLoadingExpl(true);
    try {
      const expl = await recommendationApi.getExplanation(candId);
      setExplanation(expl);
    } catch (e) {
      console.error('Failed to load candidate SHAP explanation:', e);
    } finally {
      setLoadingExpl(false);
    }
  };

  const selectedCandidate = candidates.find((c) => c.user_id === selectedCandidateId);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Header */}
      <div className="p-6 rounded-xl bg-surface border border-edge space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-accent-indigo text-xs font-semibold">
          <BrainCircuit className="w-3.5 h-3.5" /> Explainable AI (XAI) Architecture
        </div>
        <h1 className="text-2xl font-extrabold text-fg">SHAP Model Transparency Hub</h1>
        <p className="text-xs text-muted max-w-2xl">
          CoFound AI eliminates black-box team recommendations through cooperative game-theoretic <strong>Shapley Additive Explanations (SHAP)</strong>, decomposing predictions into transparent positive and negative feature attributions.
        </p>
      </div>

      {/* Mathematical Foundation Theory Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="p-5 rounded-lg bg-surface2/80 border border-edge space-y-2">
          <span className="text-accent-indigo font-bold flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" /> Additive Feature Attribution
          </span>
          <p className="text-muted leading-relaxed text-[11px]">
            Every prediction f(x) is represented as base expected value E[f(x)] plus the sum of individual feature contributions: f(x) = φ₀ + Σ φᵢ.
          </p>
        </div>

        <div className="p-5 rounded-lg bg-surface2/80 border border-edge space-y-2">
          <span className="text-accent-purple font-bold flex items-center gap-1.5">
            <Layers className="w-4 h-4" /> Global Feature Importance
          </span>
          <p className="text-muted leading-relaxed text-[11px]">
            Measures the mean absolute SHAP value across the entire candidate benchmark population: I_j = (1/N) * Σ |φ_j^(k)|.
          </p>
        </div>

        <div className="p-5 rounded-lg bg-surface2/80 border border-edge space-y-2">
          <span className="text-accent-emerald font-bold flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" /> Local Pairwise Explanations
          </span>
          <p className="text-muted leading-relaxed text-[11px]">
            Identifies the exact behavioral, technical, or communication drivers that positively or negatively influenced a candidate's compatibility rating.
          </p>
        </div>
      </div>

      {/* Global SHAP Feature Importance Section */}
      <div className="p-6 rounded-xl bg-surface border border-edge space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-fg flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent-indigo" /> Global Feature Attribution Hierarchy
            </h2>
            <p className="text-xs text-muted">
              Mean absolute SHAP impact across all 17 feature dimensions on the test dataset.
            </p>
          </div>
          <span className="text-xs text-accent-indigo font-mono font-semibold bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
            Model: {mlStatus?.algorithm || 'Gradient Boosting'}
          </span>
        </div>

        {mlStatus?.global_feature_importance ? (
          <FeatureImportanceChart data={mlStatus.global_feature_importance} />
        ) : (
          <div className="text-center py-12 text-subtle text-xs">Loading global feature importance...</div>
        )}
      </div>

      {/* Interactive Local SHAP Pairwise Explorer */}
      <div className="p-6 rounded-xl bg-surface border border-edge space-y-6">
        <div>
          <h2 className="text-base font-extrabold text-fg flex items-center gap-2">
            <Users className="w-4 h-4 text-accent-indigo" /> Interactive Pairwise SHAP Decomposition Explorer
          </h2>
          <p className="text-xs text-muted">
            Select a candidate from the pool to inspect local feature attributions explaining their specific compatibility score.
          </p>
        </div>

        {/* Candidate Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {candidates.slice(0, 8).map((cand) => (
            <button
              key={cand.user_id}
              onClick={() => handleSelectCandidate(cand.user_id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
                selectedCandidateId === cand.user_id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-surface2 text-muted hover:text-fg border border-edge'
              }`}
            >
              <span>{cand.full_name}</span>
              <span className="text-[10px] opacity-80">({Math.round(cand.overall_compatibility)}%)</span>
            </button>
          ))}
        </div>

        {/* Local SHAP Waterfall Rendering */}
        {loadingExpl ? (
          <div className="text-center py-12 text-muted text-xs">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto text-indigo-500 mb-2" />
            Computing local TreeExplainer SHAP values...
          </div>
        ) : explanation ? (
          <SHAPWaterfallChart
            contributions={explanation.all_contributions}
            baseValue={explanation.base_value}
            predictedScore={explanation.predicted_compatibility}
            candidateName={selectedCandidate?.full_name || 'Selected Candidate'}
          />
        ) : (
          <div className="text-center py-12 text-subtle text-xs">Select a candidate above to view SHAP attribution.</div>
        )}
      </div>
    </div>
  );
};
