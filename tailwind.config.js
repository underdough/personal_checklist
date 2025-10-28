/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",              // archivos HTML raíz
    "./public/**/*.html",    // HTML dentro de /public
    "./public/**/*.js",      // JS dentro de /public
    "./src/**/*.js",         // JS de desarrollo
    "!./node_modules/**",    // 🚫 excluye node_modules
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
