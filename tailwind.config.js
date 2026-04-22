/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#06264D',
        secondary: '#0F4C81',
        accent: '#00C2FF',
        light: '#F8FAFC',
        dark: '#0B1120',
      },
      borderRadius: {
        '2xl': '16px',
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'Manrope', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
