/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Matches the design reference's CSS custom properties exactly.
        ink: '#0B0F1E', // --bg (page background, dark mode)
        primary: {
          50: '#eef5ff',
          100: '#d9e8ff',
          400: '#3b82f6', // --accent-hover
          500: '#2563eb', // --accent
          600: '#1d4ed8',
          700: '#1e40af',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 4px 20px rgba(37, 99, 235, 0.25)',
        'glow-lg': '0 14px 36px rgba(37, 99, 235, 0.3)',
      },
    },
  },
  plugins: [],
};