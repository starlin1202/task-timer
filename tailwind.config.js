/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#FF7A00",
        "primary-dark": "#E66E00",
        "brand-orange": "#FF6B00",
        "background-main": "#FDFDFD",
        "card-bg": "#ffffff",
        "text-main": "#1a1c1b",
        "text-secondary": "#64748b",
        "chart-1": "#FF6B00",
        "chart-2": "#FF9F5A",
        "chart-3": "#FFCC9D",
        "chart-4": "#FFE9D6",
      },
      fontFamily: {
        "display": ["Inter", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "sans-serif"]
      },
      borderRadius: { 
        "DEFAULT": "0.25rem", 
        "lg": "0.5rem", 
        "xl": "1rem", 
        "2xl": "1.5rem", 
        "full": "9999px" 
      },
    },
  },
  plugins: [],
}