import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        graphite: {
          950: '#0A0B0D',
          900: '#0F1014',
          850: '#14161C',
          800: '#1A1D24',
          700: '#262933',
        },
        stone: {
          cool: {
            800: '#252932',
            700: '#343A46',
            600: '#485060',
            500: '#646D80',
            400: '#8A94A6',
          },
          warm: {
            800: '#232220',
            700: '#33312D',
            600: '#4A4741',
            500: '#6E6A62',
            400: '#9E9A90',
            300: '#CCC8BE',
            200: '#E4E1D8',
            100: '#F4F2EC',
          },
        },
        ochre: {
          DEFAULT: '#D97736', // Primary oxide / ochre
          hover: '#E5884B',
          muted: '#8A4A1F',
          surface: '#241710',
          border: '#542E18',
        },
      },
      fontFamily: {
        serif: ['var(--font-newsreader)', 'Georgia', 'serif'],
        sans: ['var(--font-albert)', 'sans-serif'],
        mono: ['var(--font-plex-mono)', 'monospace'],
      },
      borderRadius: {
        xs: '2px',
        sm: '4px',
        DEFAULT: '6px',
        md: '8px',
      },
      boxShadow: {
        hairline: 'inset 0 0 0 1px rgba(255, 255, 255, 0.08)',
        'hairline-hover': 'inset 0 0 0 1px rgba(255, 255, 255, 0.16)',
        'hairline-ochre': 'inset 0 0 0 1px rgba(217, 119, 54, 0.4)',
      },
    },
  },
  plugins: [],
};

export default config;
