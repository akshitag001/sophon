/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        clash: ['"Clash Display"', 'sans-serif'],
        satoshi: ['Satoshi', '-apple-system', 'sans-serif'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        sans: ['Satoshi', '-apple-system', 'sans-serif'],
      },
      colors: {
        paper: '#f2f2f2',
        ink: '#111111',
        dark: '#1e1e1e',
        muted: '#838282',
        subtle: '#b6b5b5',
      },
      transitionTimingFunction: {
        'swiss': 'cubic-bezier(0.77, 0, 0.175, 1)',
      },
      animation: {
        'fade-in': 'fade-in 0.3s cubic-bezier(0.77, 0, 0.175, 1) forwards',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
