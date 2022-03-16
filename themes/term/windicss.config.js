const { defineConfig } = require("windicss/helpers");

module.exports = defineConfig({
  theme: {
    extend: {
      colors: {
        'light': '#BFBDB6',
        'dark': '#0B0E14'
      },
      fontFamily: {
        mono: ['Recursive'],
        sans: ['Recursive']
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
    'font-sans': {
      '@apply': 'font-sans',
      'font-variation-settings': '"MONO" 0, "CASL" 0, "slnt" 0, "CRSV" 0.5'
    }
  }
});