import { useTheme } from '../context/ThemeContext';

/**
 * Recharts styling props (grid lines, axis ticks, tooltip chrome) are plain
 * hex strings passed into JS, so they can't pick up our CSS-variable design
 * tokens automatically the way Tailwind classes do. This hook centralizes
 * the light/dark equivalents so every chart stays legible in both themes.
 */
export const useChartTheme = () => {
  const { theme } = useTheme();
  const dark = theme === 'dark';

  return {
    grid: dark ? '#334155' : '#e2e8f0',
    axis: dark ? '#94a3b8' : '#64748b',
    axisLabel: dark ? '#64748b' : '#94a3b8',
    tooltip: {
      backgroundColor: dark ? '#0f172a' : '#ffffff',
      borderColor: dark ? '#334155' : '#e2e8f0',
      color: dark ? '#e2e8f0' : '#0f172a',
    },
  };
};
