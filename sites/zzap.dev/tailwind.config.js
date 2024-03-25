/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "selector",
  content: ["./docs/**/*.{html,ts,tsx,md,mdx}"],
  corePlugins: {
    preflight: false,
  },
  prefix: "tw-",
  important: true,
  theme: {
    extend: {},
  },
};
