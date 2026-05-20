/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* ── Stitch Gen-Z Neo-Brutalist Palette ── */
        'butter-cream':   '#FEFCE8',
        'punchy-orange':  '#FB923C',
        'pure-black':     '#000000',
        'pure-white':     '#FFFFFF',
        'soft-lavender':  '#DDD6FE',
        'primary-yellow': '#fde047',
        'primary-fixed':  '#ffe24c',
        'surface-bright': '#f9f9f9',
        'surface-container': '#eeeeee',
        'surface-container-low': '#f3f3f3',
        'surface-dim':    '#dadada',
        'inverse-surface':'#303030',
        'on-surface':     '#1b1b1b',
        'on-surface-variant': '#4b4734',
        'outline':        '#7d7761',
        'outline-variant':'#cec6ad',
        'stitch-error':   '#ba1a1a',
        'stitch-error-container': '#ffdad6',
        'tertiary-container': '#e3dcff',
        'secondary-container': '#fd933d',
      },
      fontFamily: {
        'headline': ['"Bricolage Grotesque"', 'sans-serif'],
        'body':     ['"Hanken Grotesk"', 'sans-serif'],
        'label':    ['"Space Mono"', 'monospace'],
      },
      boxShadow: {
        'neo':       '4px 4px 0px 0px #000000',
        'neo-sm':    '2px 2px 0px 0px #000000',
        'neo-lg':    '8px 8px 0px 0px #000000',
        'neo-orange':'4px 4px 0px 0px #FB923C',
        'neo-inset': 'inset 2px 2px 0px 0px #000000',
      },
    },
  },
  plugins: [],
}
