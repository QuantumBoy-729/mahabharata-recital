/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        sanskrit: ['"Tiro Devanagari Sanskrit"', 'serif'],
      },
      colors: {
        saffron: {
          50: '#fff8ee',
          100: '#ffefd4',
          200: '#ffdca8',
          300: '#ffc171',
          400: '#ff9a38',
          500: '#ff7a14',
          600: '#f05e0a',
          700: '#c7440a',
          800: '#9e3711',
          900: '#7f3012',
          950: '#451507',
        },
        ink: {
          50: '#f6f4ef',
          100: '#e9e4d6',
          200: '#d4caaf',
          300: '#b9aa82',
          400: '#a08d61',
          500: '#8a7752',
          600: '#766243',
          700: '#5e4d38',
          800: '#403428',
          900: '#241c14',
          950: '#15100b',
        },
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '70ch',
          },
        },
      },
    },
  },
  plugins: [],
}
