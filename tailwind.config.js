/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,tsx}', './components/**/*.{js,ts,tsx}', './feature/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        'primary-dark': '#1b1b1b',

        info: '#4DB6AC',
        success: '#4DB6AC',
        warning: '#FF5C93',
        error: '#FF5C93',
      },
    },
  },
  darkMode: 'class',
  plugins: [],
};
