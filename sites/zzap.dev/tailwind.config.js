/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "selector",
  content: ["./**/*.{html,md,mdx}"],
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/typography")],
};
