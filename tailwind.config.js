/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#0b0907', 900: '#0b0907', 800: '#13100d', 700: '#1c1814', 600: '#2a241e' },
        ember: { DEFAULT: '#e2561b', 400: '#f2763a', 500: '#e2561b', 600: '#c2440f', 700: '#93330b' },
        cream: { DEFAULT: '#f3e9d8', 100: '#faf5ec', 200: '#f3e9d8', 300: '#e6d6bb' },
        mustard: '#f2b33d',
      },
      fontFamily: {
        display: ['Anton', 'Impact', 'Haettenschweiler', 'sans-serif'],
        sans: ['Archivo', 'system-ui', 'sans-serif'],
        mark: ['"Permanent Marker"', 'cursive'],
      },
      letterSpacing: { tightest: '-0.03em' },
      boxShadow: {
        ember: '0 20px 60px -15px rgba(226,86,27,.55)',
        deep: '0 30px 80px -20px rgba(0,0,0,.8)',
      },
      keyframes: {
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        floaty: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-14px)' } },
        spinslow: { to: { transform: 'rotate(360deg)' } },
      },
      animation: {
        marquee: 'marquee 38s linear infinite',
        floaty: 'floaty 6s ease-in-out infinite',
        spinslow: 'spinslow 22s linear infinite',
      },
    },
  },
  plugins: [],
};
