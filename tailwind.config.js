/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FAF6F0",
        charcoal: "#1C1917",
        roof: "#7A4A2B",
        mapo: "#E8A020",
        agodi: "#1F7A4D",
        asale: "#121212",
      },
      fontFamily: {
        display: ["Sora", "Fraunces", "Plus Jakarta Sans", "Noto Sans", "sans-serif"],
        body: ["Plus Jakarta Sans", "DM Sans", "Noto Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};
