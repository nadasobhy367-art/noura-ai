/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
    extend: {
      colors: {
        // Medical Color Palette
        medical: {
          50: '#f0f7ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c3d66',
          950: '#0d6efd', // Primary Medical Blue
        },
        health: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#145231',
          950: '#0a3622',
        },
        alert: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#7f1d1d',
        },
        ai: {
          cyan: '#22d3ee',
          purple: '#9333ea',
          indigo: '#6366f1',
        },
        // Legacy Noura Colors
        noura: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },
        secondary: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        },
      },
      fontFamily: {
        'cairo': ['Cairo', 'sans-serif'],
        'arabic': ['Cairo', 'Tajawal', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-medical': 'pulseMedical 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'heartbeat': 'heartbeat 1.2s ease-in-out infinite',
        'glow-medical': 'glowMedical 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseMedical: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '25%': { transform: 'scale(1.05)' },
          '50%': { transform: 'scale(1)' },
        },
        glowMedical: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(13, 110, 253, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(13, 110, 253, 0.6)' },
        },
      },
      boxShadow: {
        'medical': '0 10px 40px rgba(13, 110, 253, 0.1)',
        'medical-lg': '0 20px 60px rgba(13, 110, 253, 0.15)',
        'health': '0 10px 40px rgba(34, 197, 94, 0.1)',
        'health-lg': '0 20px 60px rgba(34, 197, 94, 0.15)',
        'noura': '0 10px 40px rgba(168, 85, 247, 0.1)',
        'noura-lg': '0 20px 60px rgba(168, 85, 247, 0.15)',
      },
      backgroundImage: {
        'medical-gradient': 'linear-gradient(135deg, #0d6efd 0%, #9333ea 100%)',
        'health-gradient': 'linear-gradient(135deg, #22c55e 0%, #22d3ee 100%)',
        'alert-gradient': 'linear-gradient(135deg, #dc2626 0%, #f59e0b 100%)',
      },
    },
  },
  plugins: [],
}
