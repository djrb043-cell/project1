/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        purple: {
          950: '#21005f',
          900: '#30008a',
          800: '#3d00a8',
          700: '#4b00c6',
          600: '#5d12d6',
          500: '#7838e4',
          400: '#9565ed',
          300: '#b899f4',
          200: '#d7c4fa',
          100: '#ece5fc',
          50:  '#f7f4fd',
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
