const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  darkMode: 'class', // Enable dark mode using a class
  content: [
    './index.html',
    './frontend/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        // Add your custom colors here
        indigo: {
          ...defaultTheme.colors.indigo,
          600: '#5a67d8', // Example override
        },
      },
    },
  },
  plugins: [],
};