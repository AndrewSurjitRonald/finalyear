import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { assessmentApi } from '../services/api';
import { QuestionnaireItem, DimensionScore, AssessmentSummary } from '../types';
import {
  BrainCircuit, CheckCircle2, Award, Sparkles, ArrowRight,
  ShieldCheck, AlertCircle, RefreshCw
} from 'lucide-react';
import { RadarChartComponent } from '../components/RadarChart';

const LIKERT_OPTIONS = [
  { value: 1, label: 'Strongly Disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Neutral' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly Agree' },
];

export const AssessmentPage: React.FC = () => {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState<'personality' | 'work_style' | 'communication'>('personality');
  const [items, setItems] = useState<QuestionnaireItem[]>([]);
  const [responses, setResponses] = useState<Record<number, number>>({});
  const [summary, setSummary] = useState<AssessmentSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadCategoryItems = async (cat: 'personality' | 'work_style' | 'communication') => {
    setLoading(true);
    try {
      const data = await assessmentApi.getItems(cat);
      setItems(data);
    } catch (e) {
      console.error('Failed to load questionnaire items:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const data = await assessmentApi.getSummary();
      setSummary(data);
    } catch (e) {
      console.error('Failed to load assessment summary:', e);
    }
  };

  useEffect(() => {
    loadCategoryItems(activeCategory);
    loadSummary();
  }, [activeCategory]);

  const handleSelectOption = (itemId: number, val: number) => {
    setResponses((prev) => ({ ...prev, [itemId]: val }));
  };

  const handleSubmit = async () => {
    const payload = items.map((item) => ({
      item_id: item.id,
      response_value: responses[item.id] || 3,
    }));

    setSubmitting(true);
    setSuccessMessage(null);
    try {
      await assessmentApi.submit(activeCategory, payload);
      setSuccessMessage(`${activeCategory.replace('_', ' ').toUpperCase()} assessment saved & normalized!`);
      await loadSummary();

      // Auto advance to next assessment
      if (activeCategory === 'personality') setActiveCategory('work_style');
      else if (activeCategory === 'work_style') setActiveCategory('communication');
    } catch (e) {
      console.error('Submission failed:', e);
    } finally {
      setSubmitting(false);
    }
  };

  // Prepare radar chart data
  const personalityRadarData = summary?.personality_scores
    ? Object.entries(summary.personality_scores).map(([k, v]) => ({
        dimension: k.charAt(0).toUpperCase() + k.slice(1).replace('_', ' '),
        value: Math.round(v * 100),
      }))
    : [];

  const workStyleRadarData = summary?.work_style_scores
    ? Object.entries(summary.work_style_scores).map(([k, v]) => ({
        dimension: k.charAt(0).toUpperCase() + k.slice(1).replace('_', ' '),
        value: Math.round(v * 100),
      }))
    : [];

  const answeredCount = items.filter((it) => responses[it.id] !== undefined).length;
  const progressPct = items.length > 0 ? Math.round((answeredCount / items.length) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-xl bg-surface2 border border-indigo-500/20">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-accent-indigo text-xs font-semibold mb-2">
            <BrainCircuit className="w-3.5 h-3.5" /> Psychometric Profiling Engine
          </div>
          <h1 className="text-2xl font-extrabold text-fg">Behavioral & Collaborative Assessments</h1>
          <p className="text-xs text-muted max-w-xl mt-1">
            Complete self-reported evaluations across Big Five traits, Work Style preferences, and Communication norms. Scores are normalized to standard vectors for ML feature engineering.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-surface2/80 px-4 py-3 rounded-lg border border-edge">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center text-accent-indigo">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-muted uppercase font-bold tracking-wider block">Status</span>
            <span className={`text-xs font-bold ${summary?.is_complete ? 'text-accent-emerald' : 'text-accent-amber'}`}>
              {summary?.is_complete ? 'All Assessments Complete ✓' : 'In Progress (Partial)'}
            </span>
          </div>
        </div>
      </div>

      {/* Category Navigation Pills */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-lg bg-surface2 border border-edge">
        <button
          onClick={() => setActiveCategory('personality')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeCategory === 'personality'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-muted hover:text-fg'
          }`}
        >
          <BrainCircuit className="w-4 h-4" /> Big Five Personality (15)
        </button>
        <button
          onClick={() => setActiveCategory('work_style')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeCategory === 'work_style'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-muted hover:text-fg'
          }`}
        >
          <Award className="w-4 h-4" /> Work Style Preferences (10)
        </button>
        <button
          onClick={() => setActiveCategory('communication')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeCategory === 'communication'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-muted hover:text-fg'
          }`}
        >
          <Sparkles className="w-4 h-4" /> Communication Dynamics (8)
        </button>
      </div>

      {/* Main Content Grid: Questionnaire on Left, Live Radar on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Questionnaire Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Indicator */}
          <div className="p-4 rounded-lg bg-surface border border-edge space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-fg/80">
                Answered: {answeredCount} / {items.length} questions
              </span>
              <span className="font-bold text-accent-indigo">{progressPct}%</span>
            </div>
            <div className="h-2 w-full bg-surface3 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-accent-emerald text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Question List */}
          <div className="space-y-4">
            {items.map((item, index) => {
              const selectedVal = responses[item.id];
              return (
                <div
                  key={item.id}
                  className="p-5 rounded-lg bg-surface border border-edge space-y-3.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-xs font-bold text-accent-indigo">
                      Q{index + 1}.
                    </span>
                    <p className="text-xs font-medium text-fg flex-1 leading-relaxed">
                      {item.question_text}
                    </p>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-surface3/80 text-muted capitalize">
                      {item.dimension.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Likert Scale 1-5 */}
                  <div className="grid grid-cols-5 gap-1.5 pt-1">
                    {LIKERT_OPTIONS.map((opt) => {
                      const isSelected = selectedVal === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleSelectOption(item.id, opt.value)}
                          className={`py-2 px-1 rounded-xl text-[10px] font-semibold text-center transition flex flex-col items-center gap-1 ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-md scale-[1.02]'
                              : 'bg-surface2/80 text-muted hover:text-fg hover:bg-surface3 border border-edge'
                          }`}
                        >
                          <span className="text-xs font-bold">{opt.value}</span>
                          <span className="hidden sm:inline text-[9px] truncate max-w-[70px]">{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-2"
            >
              {submitting ? 'Normalizing Scores...' : <>Save Assessment & Update Features <ArrowRight className="w-4 h-4" /></>}
            </button>
          </div>
        </div>

        {/* Live Psychometric Visualizer on Right */}
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-surface border border-edge space-y-4 sticky top-24">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent-indigo" />
              <h3 className="text-xs font-bold text-fg uppercase tracking-wider">
                Normalized Dimension Radar
              </h3>
            </div>

            {personalityRadarData.length > 0 ? (
              <RadarChartComponent
                data={activeCategory === 'work_style' && workStyleRadarData.length > 0 ? workStyleRadarData : personalityRadarData}
                title={activeCategory === 'work_style' ? 'Work Style Vector' : 'Big Five Vector'}
                color={activeCategory === 'work_style' ? '#38bdf8' : '#818cf8'}
                height={240}
              />
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-center p-4 text-xs text-subtle">
                <BrainCircuit className="w-8 h-8 text-edge2 mb-2" />
                Submit this assessment to compute your normalized behavioral vectors.
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-surface2/60 border border-edge text-[11px] text-muted leading-relaxed">
              <strong className="text-fg/80">Feature Engineering Note: </strong>
              Scores are automatically scaled into $[0.0, 1.0]$ dimension vectors, compensating for reverse-coded questions before ML model pairwise inference.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
