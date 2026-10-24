/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  // 'media' (the preset default) makes react-native-css-interop's web runtime
  // throw an uncaught "Cannot manually set color scheme" error on every load —
  // its own bootstrap MutationObserver calls colorScheme.set() unconditionally,
  // and that call is only valid in 'class' mode. The app has no dark-mode
  // styling (nothing calls colorScheme.set/toggle), so this has no visible
  // effect beyond silencing that error.
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
};
