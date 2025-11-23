/** @type {import('tailwindcss').Config} */
module.exports = {
  // Ensure this line is present to enable dark mode based on class toggling
  darkMode: 'class', 
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      colors: {
        // Defined custom brand colors
        admin: {
          sidebar: '#afa2ba', // Light Mode Sidebar Color
          bg: '#dcd3e2',      // Light Mode Admin Content Background
          active: '#89cff0',
        },
        brand: {
          purple: '#a86add',
          blue: '#2563eb',
          darkPurple: '#4b0082', // For Logo/Dark Accents
        }
      }
    },
  },
  plugins: [],
}