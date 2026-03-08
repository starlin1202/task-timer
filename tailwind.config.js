/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors
        "primary": "#F26522",
        "primary-dark": "#D84315",
        "primary-light": "#FFF3E0",
        
        // Legacy colors (for backward compatibility)
        "brand-orange": "#F26522",
        
        // Background Colors
        "background-main": "#FAFAFA",
        "background-light": "#FAFAFA",
        "background-dark": "#121212",
        
        // Surface Colors
        "surface-light": "#FFFFFF",
        "surface-dark": "#1E1E1E",
        "card-bg": "#ffffff",
        
        // Text Colors
        "text-main": "#333333",
        "text-main-light": "#333333",
        "text-main-dark": "#E0E0E0",
        "text-secondary": "#666666",
        "text-sub-light": "#666666",
        "text-sub-dark": "#A0A0A0",
        
        // Border Colors
        "border-light": "#E5E5E5",
        "border-dark": "#333333",
        
        // Chart Colors
        "chart-1": "#F26522",
        "chart-2": "#FF9F5A",
        "chart-3": "#FFCC9D",
        "chart-4": "#FFE9D6",
        
        // Status Colors
        "danger": "#EF4444",
      },
      fontFamily: {
        "sans": ["'Noto Sans SC'", "Inter", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "sans-serif"],
        "display": ["'Noto Sans SC'", "Inter", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "sans-serif"]
      },
      borderRadius: { 
        "DEFAULT": "0.5rem", 
        "lg": "0.75rem", 
        "xl": "1rem", 
        "2xl": "1.5rem",
        "3xl": "1.5rem",
        "full": "9999px" 
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'nav': '0 -2px 10px rgba(0,0,0,0.03)',
        'orange-glow': '0 10px 25px -5px rgba(242, 101, 34, 0.15), 0 8px 10px -6px rgba(242, 101, 34, 0.1)',
      },
    },
  },
  plugins: [],
}
