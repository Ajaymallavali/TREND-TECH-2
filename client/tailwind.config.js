/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f5f6f8',
          100: '#e7e9ee',
          200: '#c7ccd6',
          300: '#a1a8b8',
          400: '#727c93',
          500: '#4f5877',
          600: '#3a415c',
          700: '#2b3145',
          800: '#1c2032',
          900: '#12141f',
          950: '#090a10',
        },
        accent: {
          50: '#eefcf3',
          100: '#d6f7e2',
          200: '#adeec7',
          300: '#75dea6',
          400: '#3fc47f',
          500: '#1ea864',
          600: '#12864f',
          700: '#106b42',
          800: '#0f5537',
          900: '#0e462f',
        },
        deal: {
          excellent: '#12864f',
          great: '#3fc47f',
          fair: '#c88a1a',
          expensive: '#d97a2c',
          veryExpensive: '#c23b3b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(9,10,16,0.04), 0 1px 6px rgba(9,10,16,0.06)',
      },
    },
  },
  plugins: [],
};
