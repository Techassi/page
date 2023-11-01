const { defineConfig } = require("windicss/helpers");

module.exports = defineConfig({
  theme: {
    extend: {
      colors: {
        'orange': '#BC5215',
        'muted': '#343331',
        'light': '#cecdc3',
        'dark': '#100F0F'
      },
      fontFamily: {
        mono: ['Roboto Mono'],
        sans: ['Bricolage Grotesque']
      },
      animation: {
        blink: 'blink 1s linear infinite'
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
    }
  },
  extract: {
    exclude: ['node_modules', '.git']
  },
  shortcuts: {
    'font-mono': {
      '@apply': 'font-mono',
      'font-variation-settings': '"MONO" 1, "CASL" 0, "slnt" 0, "CRSV" 0.5'
    },
  }
});