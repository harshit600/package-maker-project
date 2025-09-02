/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Mulish", "sans-serif"],
      },
      boxShadow: {
        lg: "0 10px 25px -5px rgba(0, 0, 0, 0.05)",
      },
    },
  },
  plugins: [],
};
