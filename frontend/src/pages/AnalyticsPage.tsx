import React, { useState, useEffect } from 'react';
import { analyticsApi } from '../services/api';
import { AnalyticsOverview } from '../types';
import {
  BarChart3, Users, FolderKanban, Sparkles, ShieldCheck,
  TrendingUp, PieChart, CheckCircle2, Award
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi.getOverview().then((data) => {
      setOverview(data);
      setLoading(false);
    }).catch((err) => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading || !overview) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center text-xs text-muted">
        Loading platform analytics...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="p-6 rounded-xl bg-surface border border-edge space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-accent-indigo text-xs font-semibold">
          <BarChart3 className="w-3.5 h-3.5" /> Platform Intelligence
        </div>
        <h1 className="text-2xl font-extrabold text-fg">System Analytics & Distribution Metrics</h1>
        <p className="text-xs text-muted max-w-2xl">
          Aggregated behavioral compatibility distributions, technical skill inventories, and conflict-risk demographics across the candidate ecosystem.
        </p>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-lg bg-surface border border-edge space-y-1">
          <span className="text-[11px] text-muted uppercase font-semibold">Registered Profiles</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-fg">{overview.total_users}</span>
            <span className="text-[10px] text-accent-emerald font-semibold">+60 Seeded</span>
          </div>
        </div>

        <div className="p-5 rounded-lg bg-surface border border-edge space-y-1">
          <span className="text-[11px] text-muted uppercase font-semibold">Active Projects</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-accent-indigo">{overview.total_projects}</span>
            <span className="text-[10px] text-subtle font-medium">Initiatives</span>
          </div>
        </div>

        <div className="p-5 rounded-lg bg-surface border border-edge space-y-1">
          <span className="text-[11px] text-muted uppercase font-semibold">Teams Generated</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-accent-purple">{overview.total_teams_generated}</span>
            <span className="text-[10px] text-accent-purple font-medium">Optimized</span>
          </div>
        </div>

        <div className="p-5 rounded-lg bg-surface border border-edge space-y-1">
          <span className="text-[11px] text-muted uppercase font-semibold">Average Compatibility</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-accent-emerald">{overview.average_platform_compatibility}%</span>
            <span className="text-[10px] text-subtle font-medium">Mean pairwise</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compatibility Distribution */}
        <div className="p-6 rounded-xl bg-surface border border-edge space-y-4">
          <div>
            <h3 className="text-sm font-bold text-fg flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent-indigo" /> Pairwise Compatibility Score Distribution
            </h3>
            <p className="text-[11px] text-muted">Distribution of predicted collaborative chemistry scores across candidate pairs.</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer>
              <BarChart data={overview.compatibility_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="range" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Skills Distribution */}
        <div className="p-6 rounded-xl bg-surface border border-edge space-y-4">
          <div>
            <h3 className="text-sm font-bold text-fg flex items-center gap-2">
              <Award className="w-4 h-4 text-accent-purple" /> Technical Skill Prevalence
            </h3>
            <p className="text-[11px] text-muted">Most frequent technical skills available in the candidate database.</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer>
              <BarChart data={overview.top_skills_distribution} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                <XAxis type="number" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis dataKey="skill" type="category" stroke="#94a3b8" tick={{ fontSize: 10 }} width={80} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Conflict Risk Breakdown */}
      <div className="p-6 rounded-xl bg-surface border border-edge space-y-4">
        <h3 className="text-sm font-bold text-fg flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-accent-emerald" /> Platform Conflict Risk Breakdown
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-900/40 text-center space-y-1">
            <span className="text-xs font-bold text-accent-emerald block">Low Conflict Risk</span>
            <span className="text-2xl font-extrabold text-fg">{overview.conflict_risk_breakdown.low}%</span>
            <span className="text-[10px] text-muted block">Strong psychometric & communication alignment</span>
          </div>
          <div className="p-4 rounded-lg bg-amber-950/20 border border-amber-900/40 text-center space-y-1">
            <span className="text-xs font-bold text-accent-amber block">Moderate Conflict Risk</span>
            <span className="text-2xl font-extrabold text-fg">{overview.conflict_risk_breakdown.medium}%</span>
            <span className="text-[10px] text-muted block">Minor work style or pacing differences</span>
          </div>
          <div className="p-4 rounded-lg bg-rose-950/20 border border-rose-900/40 text-center space-y-1">
            <span className="text-xs font-bold text-accent-rose block">High Conflict Risk</span>
            <span className="text-2xl font-extrabold text-fg">{overview.conflict_risk_breakdown.high}%</span>
            <span className="text-[10px] text-muted block">Multiple dominant leaders or low agreeableness</span>
          </div>
        </div>
      </div>
    </div>
  );
};
