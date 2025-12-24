import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/components/**/*.{js,vue,ts}',
    './app/layouts/**/*.vue',
    './app/pages/**/*.vue',
    './app/plugins/**/*.{js,ts}',
    './app/app.vue',
    './app/error.vue',
  ],
  theme: {
    extend: {
      colors: {
        // Neo-OGame Theme Colors
        // Primary Cyan - Main action, energy, links
        primary: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#00D1FF', // Main accent
          600: '#00b8e6',
          700: '#0891b2',
          800: '#155e75',
          900: '#164e63',
          950: '#083344',
        },
        // Success Green - Upgrades, production
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#00F59B', // Main accent
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        // Alert Red - Attacks, warnings
        alert: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#FF4D4D', // Main accent
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        // Warning Amber - Low resources, fleet transit
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#FFB800', // Main accent
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        // Space backgrounds
        space: {
          950: '#0B0E14', // Primary-Dark: Deep space
          900: '#0D1117', // Slightly lighter
          800: '#161B22', // Surface-Dark: Cards
          700: '#21262D', // Borders
          600: '#30363D', // Hover states
          500: '#484F58', // Inactive
        },
        // Neutral Gray
        neutral: {
          400: '#8E9297',
          500: '#9DA3AE',
        },
      },
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        body: ['Rajdhani', 'sans-serif'],
        mono: ['JetBrains Mono', 'Roboto Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-cosmic': 'linear-gradient(135deg, #0B0E14 0%, #161B22 50%, #0B0E14 100%)',
        'gradient-surface': 'linear-gradient(180deg, #161B22 0%, #0D1117 100%)',
      },
      boxShadow: {
        'neon-cyan': '0 0 15px rgba(0, 209, 255, 0.5)',
        'neon-green': '0 0 15px rgba(0, 245, 155, 0.5)',
        'neon-red': '0 0 15px rgba(255, 77, 77, 0.5)',
        'neon-amber': '0 0 15px rgba(255, 184, 0, 0.5)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glow-primary': '0 0 20px rgba(0, 209, 255, 0.4)',
        'glow-success': '0 0 20px rgba(0, 245, 155, 0.4)',
        'glow-alert': '0 0 20px rgba(255, 77, 77, 0.4)',
      },
      borderRadius: {
        'sm': '2px',
        'clip': '2px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'neon-pulse': 'neonPulse 2s ease-in-out infinite',
        'scan': 'scan 3s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px currentColor' },
          '100%': { boxShadow: '0 0 20px currentColor, 0 0 30px currentColor' },
        },
        neonPulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
} satisfies Config
