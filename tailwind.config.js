/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#070d16',
          900: '#0f1623',
          800: '#111827',
          700: '#1a2535',
          600: '#1e2d3d',
          500: '#243447',
        },
        brand: {
          teal: '#38bdf8',
          blue: '#3b82f6',
          cyan: '#06b6d4',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
