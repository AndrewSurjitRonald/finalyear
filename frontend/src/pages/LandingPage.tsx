import React from 'react';
import { ArrowRight, CheckCircle2, X } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (tab: string) => void;
}

const STATS = [
  { value: '17', label: 'Pairwise feature dimensions' },
  { value: '0.79', label: 'Test R² (full model)' },
  { value: '1.45', label: 'Test MAE' },
  { value: '5', label: 'Stage ablation study' },
];

const PIPELINE = [
  {
    step: '01',
    title: 'Multi-dimensional profiling',
    body: 'Candidates complete standardized Likert assessments across Big Five personality, work style, and communication dynamics, alongside a weighted technical skill inventory.',
  },
  {
    step: '02',
    title: 'Gradient ensemble + beam search',
    body: 'A 17-dimensional pairwise feature vector is scored by a trained Gradient Boosting regressor, then combinatorial beam search optimizes for collective team chemistry.',
  },
  {
    step: '03',
    title: 'SHAP attribution + role assignment',
    body: 'Every recommendation is decomposed into explicit positive and negative SHAP feature contributions, alongside a proficiency-matched role assignment.',
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="pb-24">
      {/* Hero */}
      <section className="border-b border-edge">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-14">
          <p className="label-mono mb-5">Explainable Team Chemistry &amp; Intelligent Recommendation System</p>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-fg tracking-tight leading-[1.15] max-w-3xl">
            Team formation, scored and{' '}
            <span className="text-indigo-600 dark:text-indigo-400">explained</span> — not guessed.
          </h1>

          <p className="text-sm sm:text-base text-muted leading-relaxed max-w-2xl mt-5">
            Traditional matching only looks at skills. CoFound AI bridges technical proficiency, Big Five
            behavioral traits, work style, and communication dynamics into a single compatibility model —
            with every prediction backed by a genuine SHAP TreeExplainer decomposition, not a black box.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-8">
            <button
              onClick={() => onNavigate('discovery')}
              className="btn-primary px-5 py-3 text-sm"
            >
              Explore compatible teammates <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('generator')}
              className="btn-secondary px-5 py-3 text-sm"
            >
              Launch team generator
            </button>
            <button
              onClick={() => onNavigate('research')}
              className="btn-ghost px-5 py-3 text-sm border border-edge"
            >
              Research benchmark lab
            </button>
          </div>
        </div>

        {/* Stat strip — one hairline-divided row, not four glow tiles */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-edge">
            {STATS.map((s, i) => (
              <div
                key={s.label}
                className={`py-5 ${i > 0 ? 'sm:border-l border-edge sm:pl-6' : ''} ${i % 2 === 1 ? 'pl-6 sm:pl-6' : ''}`}
              >
                <span className="font-mono text-2xl font-bold text-fg">{s.value}</span>
                <span className="text-xs text-muted block mt-1">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem vs approach — comparison list, not colored glow panels */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 border-b border-edge">
        <div className="max-w-2xl mb-10">
          <p className="label-mono mb-2">Why skills alone fail</p>
          <h2 className="text-xl sm:text-2xl font-bold text-fg">
            Most team failures aren't technical
          </h2>
          <p className="text-sm text-muted mt-2 leading-relaxed">
            Research consistently attributes the majority of startup and project team breakdowns to
            interpersonal friction, leadership clashes, and asynchronous misalignment — not a skills gap.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
          <div className="border-l-2 border-rose-500/40 pl-5 space-y-3">
            <h3 className="text-xs font-bold text-accent-rose label-mono !text-[11px] !tracking-normal !normal-case">
              Traditional team formation
            </h3>
            <ul className="space-y-2.5 text-sm text-muted">
              {[
                'Matches solely on technical keyword tags and resumes.',
                'Ignores work style differences — rigid planning vs. rapid MVP iteration.',
                'Causes leadership clashes when two dominant leaders compete for direction.',
                'Zero explainability — black-box or effectively random assignment.',
              ].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <X className="w-3.5 h-3.5 text-accent-rose shrink-0 mt-0.5" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-l-2 border-indigo-500 pl-5 space-y-3">
            <h3 className="text-xs font-bold text-accent-indigo label-mono !text-[11px] !tracking-normal !normal-case">
              CoFound AI framework
            </h3>
            <ul className="space-y-2.5 text-sm text-fg/80">
              {[
                'Balances technical complementarity, shared foundation, and required skill coverage.',
                'Evaluates Big Five behavioral synergy and psychological safety directly.',
                'Aligns communication rhythms — directness, async vs. live, frequency.',
                'Surfaces exact local SHAP force contributions behind every recommendation.',
              ].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent-indigo shrink-0 mt-0.5" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Pipeline — numbered list with hairline dividers, not icon-glow cards */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 border-b border-edge">
        <div className="max-w-2xl mb-10">
          <p className="label-mono mb-2">How it operates</p>
          <h2 className="text-xl sm:text-2xl font-bold text-fg">A principled pipeline, end to end</h2>
          <p className="text-sm text-muted mt-2 leading-relaxed">
            From psychometric intake to an explainable, optimized team roster.
          </p>
        </div>

        <div className="divide-y divide-edge border-t border-b border-edge">
          {PIPELINE.map((p) => (
            <div key={p.step} className="grid grid-cols-[3rem_1fr] sm:grid-cols-[4rem_10rem_1fr] gap-x-4 gap-y-1 py-6">
              <span className="font-mono text-sm text-subtle">{p.step}</span>
              <h3 className="text-sm font-bold text-fg sm:col-start-2">{p.title}</h3>
              <p className="text-xs text-muted leading-relaxed sm:col-start-3 col-span-2 sm:col-span-1">
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-16">
        <div className="border border-edge rounded-xl p-8 sm:p-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-fg">Ready to form your team?</h2>
            <p className="text-sm text-muted mt-2 max-w-md">
              A pre-loaded synthetic benchmark dataset is ready to go — no setup required.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('discovery')}
              className="btn-primary px-5 py-2.5 text-sm"
            >
              Start discovering teammates
            </button>
            <button
              onClick={() => onNavigate('assessments')}
              className="btn-secondary px-5 py-2.5 text-sm"
            >
              Take assessments
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
