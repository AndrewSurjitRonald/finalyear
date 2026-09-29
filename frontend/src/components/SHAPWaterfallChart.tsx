import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from 'recharts';
import { FeatureContribution } from '../types';
import { Sparkles, Info, HelpCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useChartTheme } from '../hooks/useChartTheme';

interface SHAPWaterfallProps {
  contributions: FeatureContribution[];
  baseValue: number;
  predictedScore: number;
  candidateName: string;
}

export const SHAPWaterfallChart: React.FC<SHAPWaterfallProps> = ({
  contributions,
  baseValue,
  predictedScore,
  candidateName,
}) => {
  const [viewMode, setViewMode] = useState<'plain' | 'technical'>('plain');
  const chartTheme = useChartTheme();

  // Filter top positive and negative drivers for clean visualization
  const sorted = [...contributions].sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value));
  const topFeatures = sorted.slice(0, 8);

  const chartData = topFeatures.map((c) => ({
    name: c.feature_label,
    shap: c.shap_value,
    direction: c.direction,
    explanation: c.human_explanation,
    val: c.feature_value
  }));

  return (
    <div className="p-5 rounded-lg bg-surface border border-edge space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-edge">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-accent-indigo">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-fg flex items-center gap-2">
              SHAP Explainability Decomposition
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface3 text-fg/80 font-mono">
                TreeExplainer
              </span>
            </h3>
            <p className="text-xs text-muted">
              Feature attribution explaining compatibility with <span className="text-accent-indigo font-medium">{candidateName}</span>
            </p>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center bg-surface2 p-0.5 rounded-lg border border-edge text-xs">
          <button
            onClick={() => setViewMode('plain')}
            className={`px-3 py-1 rounded-md transition font-medium ${
              viewMode === 'plain' ? 'bg-indigo-600 text-white shadow-sm' : 'text-muted hover:text-fg'
            }`}
          >
            Human Rationale
          </button>
          <button
            onClick={() => setViewMode('technical')}
            className={`px-3 py-1 rounded-md transition font-medium ${
              viewMode === 'technical' ? 'bg-indigo-600 text-white shadow-sm' : 'text-muted hover:text-fg'
            }`}
          >
            SHAP Vectors
          </button>
        </div>
      </div>

      {/* Model Base Value vs Final Prediction Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-surface2/60 border border-edge">
          <span className="text-[11px] text-muted block">Baseline Value $E[f(x)]$</span>
          <span className="text-lg font-bold text-fg">{baseValue.toFixed(1)}%</span>
        </div>
        <div className="p-3 rounded-xl bg-surface2/60 border border-edge">
          <span className="text-[11px] text-muted block">Total SHAP Shift $\sum \phi_i$</span>
          <span className={`text-lg font-bold ${predictedScore >= baseValue ? 'text-accent-emerald' : 'text-accent-amber'}`}>
            {predictedScore >= baseValue ? '+' : ''}{(predictedScore - baseValue).toFixed(1)}%
          </span>
        </div>
        <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 col-span-2 sm:col-span-1">
          <span className="text-[11px] text-accent-indigo block">Predicted Compatibility</span>
          <span className="text-lg font-extrabold text-accent-indigo">{predictedScore.toFixed(1)}%</span>
        </div>
      </div>

      {/* Technical Bar Chart / Human Cards */}
      {viewMode === 'technical' ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] text-muted px-2">
            <span>Negative Impact (Reduces Score)</span>
            <span>Positive Impact (Boosts Score)</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer>
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 70, bottom: 5 }}
              >
                <XAxis type="number" stroke={chartTheme.axis} tick={{ fontSize: 10 }} />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke={chartTheme.axis}
                  tick={{ fontSize: 10 }}
                  width={110}
                />
                <Tooltip
                  contentStyle={{
                    ...chartTheme.tooltip,
                    borderRadius: '8px',
                    fontSize: '11px'
                  }}
                  formatter={(val: any, name: any, item: any) => [
                    `${Number(val) > 0 ? '+' : ''}${Number(val).toFixed(3)} SHAP`,
                    item.payload.explanation
                  ]}
                />
                <ReferenceLine x={0} stroke={chartTheme.grid} strokeWidth={1.5} />
                <Bar dataKey="shap" radius={[4, 4, 4, 4]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.shap >= 0 ? '#10b981' : '#f43f5e'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Positive drivers */}
          <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-900/40 space-y-2">
            <h4 className="text-xs font-bold text-accent-emerald flex items-center gap-1.5">
              <ArrowUpRight className="w-4 h-4" /> Strong Synergy Drivers (Positive SHAP)
            </h4>
            <div className="space-y-1.5">
              {contributions.filter(c => c.shap_value > 0).slice(0, 4).map((c, i) => (
                <div key={i} className="p-2 rounded-lg bg-emerald-900/10 border border-emerald-800/30 text-xs">
                  <div className="flex items-center justify-between text-fg font-medium">
                    <span>{c.feature_label}</span>
                    <span className="text-accent-emerald font-mono text-[11px]">+{c.shap_value.toFixed(2)}</span>
                  </div>
                  <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">{c.human_explanation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Negative drivers / friction */}
          <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-900/40 space-y-2">
            <h4 className="text-xs font-bold text-accent-rose flex items-center gap-1.5">
              <ArrowDownRight className="w-4 h-4" /> Potential Collaboration Friction
            </h4>
            <div className="space-y-1.5">
              {contributions.filter(c => c.shap_value < 0).slice(0, 4).map((c, i) => (
                <div key={i} className="p-2 rounded-lg bg-rose-900/10 border border-rose-800/30 text-xs">
                  <div className="flex items-center justify-between text-fg font-medium">
                    <span>{c.feature_label}</span>
                    <span className="text-accent-rose font-mono text-[11px]">{c.shap_value.toFixed(2)}</span>
                  </div>
                  <p className="text-[11px] text-rose-700/80 dark:text-rose-400/80 mt-0.5">{c.human_explanation}</p>
                </div>
              ))}
              {contributions.filter(c => c.shap_value < 0).length === 0 && (
                <p className="text-xs text-muted italic p-2">No significant friction indicators detected.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
