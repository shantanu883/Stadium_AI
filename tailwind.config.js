/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fifa: {
          dark: '#030712',
          card: 'rgba(17, 24, 39, 0.7)',
          accent: '#00f0ff',
          neonPurple: '#d600ff',
          neonGreen: '#00ff66',
          neonYellow: '#ffea00',
          neonRed: '#ff003c',
          gold: '#d4af37',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'neon-blue': '0 0 15px rgba(0, 240, 255, 0.3)',
        'neon-purple': '0 0 15px rgba(214, 0, 255, 0.3)',
        'neon-green': '0 0 15px rgba(0, 255, 102, 0.3)',
        'neon-red': '0 0 15px rgba(255, 0, 60, 0.3)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
