/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        estate: {
          dark: '#080E1E',
          navy: '#0F1A30',
          card: '#152238',
          border: '#223354',
          gold: '#C5A880',
          goldlight: '#DFCAAB',
          goldhover: '#B5966B',
          accent: '#2A4365',
          cream: '#F9F8F6',
          muted: '#8A99AD',
        }
      },
      fontFamily: {
        serif: ['Cinzel', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
