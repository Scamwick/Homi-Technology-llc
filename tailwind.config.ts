import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          cyan: '#22d3ee',
          emerald: '#34d399',
          yellow: '#facc15',
        },
        surface: {
          0: '#060d1b',
          1: '#0a1628',
          2: '#0f1d32',
          3: '#1a2a44',
          4: '#253a56',
        },
        navy: '#0a1628',
        slate: {
          DEFAULT: '#1e293b',
          dark: '#0f172a',
        },
        text: {
          1: '#ffffff',
          2: 'rgba(255,255,255,0.7)',
          3: 'rgba(255,255,255,0.4)',
          4: 'rgba(255,255,255,0.2)',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      borderRadius: {
        'brand': '12px',
        'brand-sm': '8px',
        'brand-lg': '16px',
        'brand-xl': '24px',
      },
      boxShadow: {
        'brand': '0 4px 24px rgba(0,0,0,0.3)',
        'brand-lg': '0 8px 40px rgba(0,0,0,0.4)',
        'glow-cyan': '0 0 20px rgba(34,211,238,0.15)',
        'glow-emerald': '0 0 20px rgba(52,211,153,0.15)',
        'glow-yellow': '0 0 20px rgba(250,204,21,0.15)',
      },
      animation: {
        'spin-slow': 'spin 120s linear infinite',
        'spin-medium': 'spin 90s linear infinite',
        'spin-fast': 'spin 60s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
    },
  },
  plugins: [],
}
export default config
