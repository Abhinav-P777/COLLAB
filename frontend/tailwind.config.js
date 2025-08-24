/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        seenonim: ['Seenonim',],
        libre: ['"Libre Caslon Text"', 'serif'],
        bebas: ['"Bebas Neue"', 'sans-serif'],
        cardival: ['Cardival', 'sans-serif'], // Tailwind utility class
        potterit: ['potteri', 'sans-serif'], // 
        afigre: ['Afigre', 'sans-serif'], // 
      },
    },
  },
  plugins: [],
};
