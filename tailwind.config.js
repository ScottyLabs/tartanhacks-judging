/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/tw-elements/dist/js/**/*.js",
  ],
  theme: {
    extend: {
      // TH 2023-24 colors
      colors: {
        purple: "#4200ff",
        blue: "#6e9afd",
        yellow: "#fea801",
        beige: "#f7f1e2",
        inactive: "#000000",
        voted: "#2e8540",
        black: "#1b1818"
      },
    },
  },
  plugins: [require("tw-elements/dist/plugin")],
};
