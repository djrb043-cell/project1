/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        purple: {
          950: '#2d1b4e',
          900: '#3d2960',
          800: '#5b3a8c',
          700: '#7c4dc0',
          600: '#9d6fe0',
          500: '#b794f6',
          400: '#c9a8ff',
          300: '#d9c2ff',
          200: '#e6d6ff',
          100: '#f0e6ff',
          50:  '#faf5ff',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        rounded: ['Nunito', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(circle at center, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};
