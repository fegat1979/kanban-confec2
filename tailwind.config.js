/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        stage: {
          bar: "#0f172a"
        }
      }
    }
  },
  plugins: []
}