/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paytm: {
          navy: '#002970',
          darknavy: '#0f2744',
          blue: '#0052cc',
          cyan: '#00b9f1',
          lightcyan: '#e6f8fd',
          surface: '#f5f7fb',
          accent: '#00b9f1',
          gold: '#f59e0b',
          green: '#10b981',
          red: '#ef4444'
        }
      }
    },
  },
  plugins: [],
}
