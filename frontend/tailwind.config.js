/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        brand: {
          50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc',
          400: '#818cf8', 500: '#6366f1', 600: '#4F46E5', 700: '#4338ca',
          800: '#3730a3', 900: '#312e81',
        },
        coral: { 50: '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3', 400: '#fb7185', 500: '#f43f5e', 600: '#e11d48', 700: '#be123c' },
        gold: { 100: '#fef3c7', 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706' },
      },
      boxShadow: {
        soft: '0 10px 30px -12px rgba(30,27,75,.18)',
        lift: '0 24px 50px -20px rgba(30,27,75,.30)',
      },
    },
  },
  plugins: [],
}
