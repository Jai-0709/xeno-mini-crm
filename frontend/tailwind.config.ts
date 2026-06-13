import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0d0d0d',
          card: '#161616',
          sidebar: '#111111',
          active: '#1a1a2e',
        },
        border: {
          DEFAULT: '#1f1f1f',
          hover: '#2a2a2a',
        },
        accent: {
          blue: '#4f6ef7',
          purple: '#7c5cbf',
        },
        text: {
          primary: '#f0f0f0',
          secondary: '#6b7280',
          muted: '#3f3f46',
        },
        status: {
          success: '#22c55e',
          warning: '#f59e0b',
          danger: '#ef4444',
          info: '#4f6ef7',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        card: '12px',
        btn: '8px',
      },
      backgroundImage: {
        'gradient-accent': 'linear-gradient(135deg, #4f6ef7, #7c5cbf)',
        'gradient-accent-h': 'linear-gradient(90deg, #4f6ef7, #7c5cbf)',
      },
      animation: {
        'shimmer': 'shimmer 1.5s infinite',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in-right': 'slideInRight 0.3s ease',
        'slide-in-top': 'slideInTop 0.3s ease',
        'count-up': 'countUp 0.8s ease',
        'fade-in': 'fadeIn 0.2s ease',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideInTop: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      boxShadow: {
        'card': '0 0 0 1px #1f1f1f',
        'glow-blue': '0 0 20px rgba(79, 110, 247, 0.15)',
        'glow-purple': '0 0 20px rgba(124, 92, 191, 0.15)',
        'glow-green': '0 0 20px rgba(34, 197, 94, 0.15)',
      },
      transitionDuration: {
        '150': '150ms',
      },
    },
  },
  plugins: [],
};

export default config;
