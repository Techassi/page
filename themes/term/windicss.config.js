const { defineConfig } = require("windicss/helpers");

module.exports = defineConfig({
  theme: {
    extend: {
      colors: {
        'light': '#BFBDB6',
        'dark': '#0B0E14'
      },
      fontFamily: {
        mono: ['JetBrainsMono NF']
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
    exclude: ['node_modules', '.git', 'static/css/style.min.css']
  },
  safelist: 'active-link',
  alias: {
    'active-item': 'text-orange-500'
  }
});