/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // A single, deliberate "signal" accent — a precise cobalt, not the
        // default Tailwind indigo/purple. Overriding the `indigo` name
        // itself means every existing `bg-indigo-600` / `text-indigo-400` /
        // `border-indigo-500` / `ring-indigo-500` utility across the app
        // repaints to this palette with no per-file markup changes needed.
        indigo: {
          50: '#eff6ff',
          100: '#dbeaff',
          200: '#b8d4fe',
          300: '#86b6fd',
          400: '#4f8ffa',
          500: '#2570f0',
          600: '#155ed4',
          700: '#124aa8',
          800: '#123c85',
          900: '#12326d',
          950: '#0b1d42',
        },
        brand: {
          50: '#eff6ff',
          100: '#dbeaff',
          200: '#b8d4fe',
          300: '#86b6fd',
          400: '#4f8ffa',
          500: '#2570f0',
          600: '#155ed4',
          700: '#124aa8',
          800: '#123c85',
          900: '#12326d',
          950: '#0b1d42',
        },
        // Semantic, theme-aware surface/text/border tokens. Values live in
        // CSS custom properties (see index.css) so the same class names work
        // in both light and dark mode.
        page: 'rgb(var(--page) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        surface2: 'rgb(var(--surface-2) / <alpha-value>)',
        surface3: 'rgb(var(--surface-3) / <alpha-value>)',
        edge: 'rgb(var(--edge) / <alpha-value>)',
        edge2: 'rgb(var(--edge-2) / <alpha-value>)',
        fg: 'rgb(var(--fg) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        subtle: 'rgb(var(--subtle) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        'soft': '0 1px 2px rgb(0 0 0 / 0.04), 0 1px 1px rgb(0 0 0 / 0.03)',
        'card': '0 1px 3px rgb(0 0 0 / 0.06), 0 4px 24px -8px rgb(0 0 0 / 0.08)',
      },
    },
  },
  plugins: [],
}
