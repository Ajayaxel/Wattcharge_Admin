/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        appPrimary: '#000000',
        appSecondary: '#38C9AD',
        appCard: '#0F1218',
        appTextLight: '#FFFFFF',
        appTextGray: '#979797',
      },
      fontFamily: {
        manrope: ['Manrope', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

