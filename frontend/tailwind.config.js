/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"DM Mono"', '"Fira Code"', 'monospace'],
      },
      colors: {
        // Page surfaces — resolve from CSS vars (theme-aware)
        canvas: {
          DEFAULT: 'var(--canvas)',
          elevated: 'var(--canvas-elevated)',
          sunken: 'var(--canvas-sunken)',
          dark: 'var(--canvas-dark)',
        },
        ink: {
          1: 'var(--ink-1)',
          2: 'var(--ink-2)',
          3: 'var(--ink-3)',
          inverse: 'var(--canvas)',
        },
        chrome: {
          1: 'var(--chrome-1)',
          2: 'var(--chrome-2)',
          3: 'var(--chrome-3)',
        },
        // Topbar / nav chrome — theme-aware
        topbar: {
          bg: 'var(--topbar-bg)',
          border: 'var(--topbar-border)',
          text: 'var(--topbar-text)',
          subtle: 'var(--topbar-subtle)',
          muted: 'var(--topbar-muted)',
        },
        'surface-hover': 'var(--surface-hover)',
        // Brand accent — hardcoded (opacity modifiers used: bg-accent/10 etc.)
        accent: {
          DEFAULT: '#FACC15',
          hover: '#FDE047',
          deep: '#CA8A04',
          bg: 'var(--accent-bg)',
          ring: 'rgba(250,204,21,0.35)',
        },
        // MTN Brand
        mtn: {
          yellow: '#FFCC00',
          'yellow-dark': '#E6B800',
          'yellow-light': '#FFF5B3',
          black: '#000000',
          dark: '#111111',
        },
        // Status — base colors hardcoded (opacity modifiers used on these)
        status: {
          critical: '#EF4444',
          high: '#F87171',
          watch: '#FACC15',
          clear: '#22C55E',
          info: '#60A5FA',
          'critical-bg': 'var(--status-critical-bg)',
          'watch-bg': 'var(--status-watch-bg)',
          'clear-bg': 'var(--status-clear-bg)',
        },
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      letterSpacing: {
        label: '0.08em',
        'label-wide': '0.1em',
      },
      maxWidth: {
        content: '1200px',
      },
      keyframes: {
        pulseLive: {
          '0%': { boxShadow: '0 0 0 0 rgba(250,204,21,0.55)' },
          '70%': { boxShadow: '0 0 0 6px rgba(250,204,21,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(250,204,21,0)' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'pulse-live': 'pulseLive 2s infinite',
        'fade-in': 'fadeIn 200ms ease-out',
      },
    },
  },
  plugins: [],
};
