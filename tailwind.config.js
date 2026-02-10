/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Habilita o dark mode via classe 'dark' no HTML
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Definindo cores personalizadas para o dark mode se necessário
        dark: {
          bg: '#0a0a0a',
          surface: '#111111',
          border: '#222222',
          text: '#ededed'
        }
      }
    },
  },
  plugins: [
    require('tailwind-scrollbar')({ nocompatible: true }),
  ],
};
