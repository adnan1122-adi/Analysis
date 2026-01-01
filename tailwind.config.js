
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        arabic: ['Inter', 'sans-serif'], // You can add specific Arabic fonts here if desired
      },
    },
  },
  plugins: [],
}
