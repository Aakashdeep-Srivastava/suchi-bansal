/** Tailwind config — mirrors the former in-page `tailwind.config` so the
 *  compiled stylesheet matches what the CDN produced at runtime.
 *  Content globs include every file that emits class names (HTML + the JS
 *  modules that build markup from template literals + the .tsx sources). */
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './*.js',
    './*.tsx',
    './assets/*.js',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          black: '#0D0D0D',
          dark: '#141414',
          gray: '#7A7A7A',
          light: '#F8F9FA',
          border: '#E5E5E5',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
};
