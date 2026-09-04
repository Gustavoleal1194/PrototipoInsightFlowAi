/** Tokens espelhados do design system EngSeg / SGS (tema dark). */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: '#0d1117',
        surface: '#161b22',
        elevated: '#1c2128',
        muted: '#21262d',
        'border-soft': '#21262d',
        'border-main': '#30363d',
        fg: {
          0: '#e6edf3',
          1: '#c9d1d9',
          2: '#8b949e',
          3: '#484f58',
        },
        accent: { DEFAULT: '#58a6ff', hover: '#79b8ff' },
        brand: '#7dfda1',
        up: '#3fb950',
        down: '#f85149',
        warn: '#d29922',
        purple: '#d2a8ff',
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      borderRadius: { DEFAULT: '0.75rem', sm: '0.5rem', xl: '0.75rem' },
      boxShadow: {
        sm: '0 1px 3px 0 rgb(0 0 0 / 0.4)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.4)',
      },
    },
  },
  plugins: [],
};
