/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        cyber: {
          bg: {
            primary: '#0a0a0f',
            secondary: '#12121a',
            tertiary: '#1a1a2e',
          },
          neon: {
            cyan: '#00f5ff',
            pink: '#ff00ff',
            purple: '#9d00ff',
            green: '#00ff88',
            yellow: '#ffff00',
            red: '#ff0044',
            blue: '#0088ff',
            orange: '#ff6600',
          },
          text: {
            primary: '#e0e0e0',
            secondary: '#a0a0a0',
            muted: '#606060',
          },
          border: 'rgba(0, 245, 255, 0.2)',
          borderGlow: 'rgba(0, 245, 255, 0.5)',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Orbitron', 'sans-serif'],
      },
      animation: {
        'pulse-neon': 'pulse-neon 2s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'scanline': 'scanline 3s linear infinite',
        'flicker': 'flicker 0.1s infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-neon': {
          '0%, 100%': {
            boxShadow: '0 0 5px currentColor, 0 0 10px currentColor, 0 0 20px currentColor',
          },
          '50%': {
            boxShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 40px currentColor',
          },
        },
        'glow': {
          '0%, 100%': {
            filter: 'brightness(1) drop-shadow(0 0 5px currentColor)',
          },
          '50%': {
            filter: 'brightness(1.3) drop-shadow(0 0 15px currentColor)',
          },
        },
        'scanline': {
          '0%': {
            transform: 'translateY(-100%)',
          },
          '100%': {
            transform: 'translateY(100%)',
          },
        },
        'flicker': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
          '75%': { opacity: '0.9' },
        },
        'pulse-glow': {
          '0%, 100%': {
            boxShadow: '0 0 5px currentColor, 0 0 10px currentColor',
          },
          '50%': {
            boxShadow: '0 0 15px currentColor, 0 0 30px currentColor',
          },
        },
      },
    },
  },
  plugins: [],
};
