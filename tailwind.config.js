/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#FF6B35',
        'secondary': '#4ECDC4',
        'accent': '#FFE66D',
        'background': '#FFFBF5',
        'text': '#2D2D2D',
        'muted': '#888888',
      },
      fontFamily: {
        'heading': ['"Fredoka One"', 'cursive'],
        'body': ['Nunito', 'sans-serif'],
      },
    },
  },
  plugins: [],
  important: false,
}
