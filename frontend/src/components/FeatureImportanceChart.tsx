import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { GlobalFeatureImportance } from '../types';
import { useChartTheme } from '../hooks/useChartTheme';

interface FeatureImportanceChartProps {
  data: GlobalFeatureImportance[];
}

const CATEGORY_COLORS: Record<string, string> = {
  Technical: '#6366f1',
  Personality: '#ec4899',
  'Work Style': '#3b82f6',
  Communication: '#10b981',
  Leadership: '#f59e0b',
  Interests: '#8b5cf6',
  General: '#64748b'
};

export const FeatureImportanceChart: React.FC<FeatureImportanceChartProps> = ({ data }) => {
  const chartTheme = useChartTheme();

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-subtle">
        No feature importance data loaded
      </div>
    );
  }

  // Take top 12 features
  const sorted = [...data].sort((a, b) => b.importance_score - a.importance_score).slice(0, 12);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 text-[11px]">
        {Object.entries(CATEGORY_COLORS).map(([cat, col]) => (
          <span key={cat} className="flex items-center gap-1.5 text-fg/80">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col }} />
            {cat}
          </span>
        ))}
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer>
          <BarChart
            data={sorted}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
          >
            <XAxis
              type="number"
              stroke={chartTheme.axis}
              tick={{ fontSize: 10 }}
              label={{ value: 'Mean |SHAP Value| (Impact on Model Compatibility Output)', position: 'insideBottom', offset: -5, fontSize: 10, fill: chartTheme.axisLabel }}
            />
            <YAxis
              dataKey="feature_label"
              type="category"
              stroke={chartTheme.axis}
              tick={{ fontSize: 10, fontWeight: 500 }}
              width={160}
            />
            <Tooltip
              contentStyle={{
                ...chartTheme.tooltip,
                borderRadius: '8px',
                fontSize: '11px',
              }}
              formatter={(val: any, name: any, item: any) => [
                `${Number(val).toFixed(4)} Mean |SHAP|`,
                `Category: ${item.payload.category}`
              ]}
            />
            <Bar dataKey="importance_score" radius={[0, 4, 4, 0]}>
              {sorted.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CATEGORY_COLORS[entry.category] || '#6366f1'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
