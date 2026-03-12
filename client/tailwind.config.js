/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          800: '#1c1f3e',
          700: '#252850',
          600: '#2e3260',
        },
        surface: '#f6f7fb',
        success: '#00c875',
        info: '#0086c0',
        warning: '#fdab3d',
        danger: '#e2445c',
        purple: '#a25ddc',
      },
    },
  },
  plugins: [],
};
