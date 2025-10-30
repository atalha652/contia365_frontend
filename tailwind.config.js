/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  safelist: [
    "bg-yellow-100", "text-yellow-600", "dark:bg-yellow-900/40", "dark:text-yellow-200",
    "bg-blue-100", "text-blue-600", "dark:bg-blue-900/40", "dark:text-blue-200",
    "bg-purple-100", "text-purple-600", "dark:bg-purple-900/40", "dark:text-purple-200",
    "bg-gray-100", "text-gray-600", "dark:bg-gray-900/40", "dark:text-gray-200"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        // Custom color scheme using CSS variables
        bg: {
          30: "var(--bg-30)",
          40: "var(--bg-40)",
          50: "var(--bg-50)",
          60: "var(--bg-60)",
          70: "var(--bg-70)",
        },
        bd: {
          50: "var(--bd-50)",
        },
        fg: {
          40: "var(--fg-40)",
          50: "var(--fg-50)",
          60: "var(--fg-60)",
          70: "var(--fg-70)",
        },
        ac: {
          "01": "var(--ac-01)",
          "02": "var(--ac-02)",
        },
      },
    },
  },
  /* eslint-disable-next-line no-undef */
  plugins: [require('@tailwindcss/typography')],
  darkMode: "class", // Enable dark mode with class strategy
};