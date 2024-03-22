/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "selector",
  content: ["./**/*.{html,js,md}"],
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/typography")],
};
