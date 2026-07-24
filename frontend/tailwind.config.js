/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        brand: {
          50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc',
          400: '#818cf8', 500: '#6366f1', 600: '#4F46E5', 700: '#4338ca',
          800: '#3730a3', 900: '#312e81',
        },
        coral: { 400: '#fb7185', 500: '#f43f5e', 600: '#e11d48' },
      },
    },
  },
  plugins: [],
}
