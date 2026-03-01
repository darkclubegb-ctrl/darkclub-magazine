/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Cormorant Garamond — ultra-thin, high-contrast, Didot/Bodoni character
        display: ['"Cormorant Garamond"', '"Cormorant"', 'Georgia', 'serif'],
        // Inter — clean, neutral body
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      colors: {
        'brand-black': '#000000',
        'brand-white': '#FFFFFF',
        'brand-cream': '#F9F8F5',
      },
      letterSpacing: {
        'ultra-tight': '-0.06em',
        'ultra-wide': '0.4em',
        'mega-wide': '0.7em',
      },
      animation: {
        'fade-in': 'fadeIn 1.2s ease-in-out forwards',
        'fade-in-up': 'fadeInUp 1s ease-out forwards',
        'fade-in-slow': 'fadeIn 2s ease-in-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
