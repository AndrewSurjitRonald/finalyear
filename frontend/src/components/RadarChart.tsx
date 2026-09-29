import React from 'react';
import {
  Radar,
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { useChartTheme } from '../hooks/useChartTheme';

interface RadarDataPoint {
  dimension: string;
  value: number; // 0 to 100
  fullMark?: number;
}

interface CustomRadarChartProps {
  data: RadarDataPoint[];
  title?: string;
  color?: string;
  height?: number;
}

export const RadarChartComponent: React.FC<CustomRadarChartProps> = ({
  data,
  title,
  color = '#6366f1',
  height = 260
}) => {
  const chartTheme = useChartTheme();

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-subtle">
        No assessment data available
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center">
      {title && <h4 className="text-xs font-semibold text-fg/80 mb-2">{title}</h4>}
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <RechartsRadar data={data}>
            <PolarGrid stroke={chartTheme.grid} strokeDasharray="3 3" />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{ fill: chartTheme.axis, fontSize: 10, fontWeight: 500 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fill: chartTheme.axisLabel, fontSize: 9 }}
              axisLine={false}
            />
            <Radar
              name="Score"
              dataKey="value"
              stroke={color}
              fill={color}
              fillOpacity={0.4}
            />
            <Tooltip
              contentStyle={{
                ...chartTheme.tooltip,
                borderRadius: '8px',
                fontSize: '11px',
              }}
              formatter={(val: any) => [`${Math.round(Number(val))}%`, 'Score']}
            />
          </RechartsRadar>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
