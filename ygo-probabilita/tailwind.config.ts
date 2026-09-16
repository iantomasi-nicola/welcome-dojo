import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#05070d',
          900: '#0b0f1a',
          800: '#121729',
          700: '#1b2138',
          600: '#262e4a',
        },
        gold: {
          400: '#facc15',
          500: '#eab308',
        },
      },
      boxShadow: {
        glow: '0 0 40px -12px rgba(250, 204, 21, 0.35)',
      },
      keyframes: {
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
      animation: {
        pulseSoft: 'pulseSoft 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
