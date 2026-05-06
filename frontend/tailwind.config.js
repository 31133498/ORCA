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
        canvas: '#FAFAFA',
        'canvas-elevated': '#FFFFFF',
        'canvas-sunken': '#F3F4F6',
        'canvas-dark': '#0F0F0F',
        ink: {
          1: '#111111',
          2: '#4B5563',
          3: '#9CA3AF',
          inverse: '#FFFFFF',
        },
        chrome: {
          1: '#E5E7EB',
          2: '#D1D5DB',
          3: '#6B7280',
        },
        status: {
          critical: '#DC2626',
          high: '#EF4444',
          watch: '#D97706',
          clear: '#059669',
          info: '#2563EB',
          'critical-bg': '#FEF2F2',
          'watch-bg': '#FFFBEB',
          'clear-bg': '#ECFDF5',
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
          '0%': { boxShadow: '0 0 0 0 rgba(5,150,105,0.4)' },
          '70%': { boxShadow: '0 0 0 6px rgba(5,150,105,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(5,150,105,0)' },
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
