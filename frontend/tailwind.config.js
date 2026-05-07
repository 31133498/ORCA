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
        // Page surfaces (now dark)
        canvas: '#0A0A0A',
        'canvas-elevated': '#141414',
        'canvas-sunken': '#1C1C1C',
        'canvas-dark': '#000000',
        ink: {
          1: '#FAFAFA',
          2: '#A3A3A3',
          3: '#6B7280',
          inverse: '#0A0A0A',
        },
        chrome: {
          1: '#262626',
          2: '#404040',
          3: '#525252',
        },
        // Brand accent — yellow
        accent: {
          DEFAULT: '#FACC15',
          hover: '#FDE047',
          deep: '#CA8A04',
          bg: '#1F1A05',
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
        status: {
          critical: '#EF4444',
          high: '#F87171',
          watch: '#FACC15',
          clear: '#22C55E',
          info: '#60A5FA',
          'critical-bg': '#2A0E0E',
          'watch-bg': '#1F1A05',
          'clear-bg': '#0E2A1A',
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
