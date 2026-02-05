import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        outfit: ['var(--font-outfit)', 'sans-serif'],
        jakarta: ['var(--font-jakarta)', 'sans-serif'],
        rubik: ['var(--font-rubik)', 'sans-serif'],
        sans: ['var(--font-jakarta)', 'sans-serif'],
      },
      colors: {
        background: '#020617', // slate-950
        foreground: '#f8fafc', // slate-50
        card: {
          DEFAULT: '#0f172a', // slate-900
          foreground: '#f8fafc',
        },
        popover: {
          DEFAULT: '#0f172a',
          foreground: '#f8fafc',
        },
        primary: {
          DEFAULT: '#3b82f6', // blue-500
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#1e293b', // slate-800
          foreground: '#f8fafc',
        },
        muted: {
          DEFAULT: '#334155', // slate-700
          foreground: '#94a3b8', // slate-400
        },
        accent: {
          DEFAULT: '#1e293b', // slate-800
          foreground: '#f8fafc',
        },
        destructive: {
          DEFAULT: '#ef4444', // red-500
          foreground: '#ffffff',
        },
        border: '#334155', // slate-700
        input: '#1e293b', // slate-800
        ring: '#3b82f6', // blue-500
      },
      borderRadius: {
        lg: '16px', // rounded-2xl
        md: '12px', // rounded-xl
        sm: '8px',  // rounded-lg
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(59, 130, 246, 0.6)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
