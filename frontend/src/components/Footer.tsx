import React from 'react';
import { ShieldCheck, Sparkles, BookOpen, GitBranch } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-surface2 border-t border-edge text-muted text-xs py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-600/10 border border-brand-500/30 flex items-center justify-center text-accent-indigo">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-fg">CoFound AI</span>
              <span className="text-[11px] text-subtle block">Explainable Team Chemistry & Intelligent Formation</span>
            </div>
          </div>

          <div className="flex items-center gap-6 text-muted text-xs">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-accent-emerald" /> Responsible AI Architecture</span>
            <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-accent-indigo" /> SHAP XAI Integration</span>
            <span className="flex items-center gap-1.5"><GitBranch className="w-4 h-4 text-accent-purple" /> Multi-Objective Optimization</span>
          </div>
        </div>

        {/* Mandatory Responsible AI Research Disclaimer */}
        <div className="panel p-4 text-[11px] leading-relaxed text-muted">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-accent-indigo mt-0.5 shrink-0" />
            <div>
              <strong className="text-fg font-semibold">Academic & Research Decision Support Notice: </strong>
              CoFound AI provides compatibility estimates, team chemistry projections, and conflict risk signals based on self-reported psychometrics and technical profiles. Recommendations are intended strictly as decision-support heuristics for collaborative formation and not as definitive personal evaluations.
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-edge text-subtle text-[11px]">
          <p>© 2026 CoFound AI Research Project. Built for Academic Demonstration & Defense.</p>
          <p className="mt-2 sm:mt-0">FastAPI • Scikit-Learn • SHAP • React • TypeScript</p>
        </div>
      </div>
    </footer>
  );
};
