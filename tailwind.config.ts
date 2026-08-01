import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        magenta: {
          DEFAULT: '#ec13d2',
          soft: '#d45ac0',
        },
        // Her voice: a bright rose rather than the violet the darker magenta
        // turned into, still dark enough to read over the collage.
        hotpink: '#e30b7d',
        // Just off stark white, for the viewer's own lines.
        chalk: '#e2e2e6',
        // The dialog box in the mockups
        blush: {
          DEFAULT: '#e6cfdc',
          border: '#8f7d88',
        },
        plum: '#6b4b63',
      },
      fontFamily: {
        oswald: ['var(--font-oswald)', 'Oswald', 'sans-serif'],
        pinyon: ['var(--font-pinyon)', 'Pinyon Script', 'cursive'],
      },
    },
  },
  plugins: [],
};

export default config;
