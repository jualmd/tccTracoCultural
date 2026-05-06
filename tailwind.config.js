/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#8E5E56',
        secondary: '#3C2321',
        accent: '#FFFFFF',
        background: '#ffffff',
        muted: '#f0f0f0',
        surface: 'rgba(255,255,255,0.15)',
        border: 'rgba(255,255,255,0.25)',
        foreground: '#11181C',
      },
    },
  },
  plugins: [],
};
