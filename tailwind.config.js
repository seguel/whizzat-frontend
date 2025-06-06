/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}", // Se estiver usando App Router
    "./pages/**/*.{js,ts,jsx,tsx}", // Se estiver usando Pages Router
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    //backgrounds
    // Borders
    "bg-green-400",
    "bg-blue-400",
    "bg-purple-400",

    // Borders
    "border-green-400",
    "border-blue-400",
    "border-purple-400",

    // Text colors
    "text-green-300",
    "text-blue-300",
    "text-purple-300",

    // Hover backgrounds
    "hover:bg-green-400",
    "hover:bg-blue-400",
    "hover:bg-purple-400",

    // Hover text colors
    "hover:text-green-300",
    "hover:text-blue-300",
    "hover:text-purple-300",
  ],
};
