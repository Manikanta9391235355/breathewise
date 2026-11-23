/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: "#01472e",
          50: "#e6f2ed",
          100: "#cce5db",
          200: "#99cbb7",
          300: "#66b193",
          400: "#33976f",
          500: "#01472e",
          600: "#013f29",
          700: "#013422",
          800: "#01281a",
          900: "#001a11",
        },
        sage: {
          DEFAULT: "#ccd5ae",
          light: "#e2e7cc",
          dark: "#b4be91",
        },
        olive: {
          DEFAULT: "#e9edc9",
          light: "#f3f5de",
          dark: "#d5dca8",
        },
        cream: {
          DEFAULT: "#fefae0",
          light: "#fffef5",
          dark: "#f5f0cb",
        },
        moss: {
          DEFAULT: "#a3b18a",
          light: "#c1cca9",
          dark: "#84946b",
        },
        // Pollution indicator colors tuned to earthy palette
        aqi: {
          good: "#2d6a4f",
          moderate: "#c8963e",
          poor: "#d97706",
          severe: "#9b2226",
          hazard: "#6a040f",
        }
      },
      fontFamily: {
        display: ["Anton", "sans-serif"],
        sans: ["Inter", "sans-serif"],
      },
      borderRadius: {
        'section': '5rem',
        'card': '2.5rem',
      },
      boxShadow: {
        'forest': '0 10px 30px -5px rgba(1, 71, 46, 0.12), 0 4px 6px -2px rgba(1, 71, 46, 0.05)',
        'forest-lg': '0 25px 50px -12px rgba(1, 71, 46, 0.18)',
        'forest-sm': '0 4px 14px 0 rgba(1, 71, 46, 0.08)',
      },
      transitionTimingFunction: {
        'editorial': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      letterSpacing: {
        'utility': '0.2em',
        'utility-wide': '0.3em',
      }
    },
  },
  plugins: [],
};
