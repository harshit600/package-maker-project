const withMT = require("@material-tailwind/react/utils/withMT");

module.exports = withMT({
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
});
