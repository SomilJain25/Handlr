/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef5ff',
          100: '#d9e8ff',
          500: '#3b6ef0',
          600: '#2c56d1',
          700: '#2245ab',
        },
      },
    },
  },
  plugins: [],
};
