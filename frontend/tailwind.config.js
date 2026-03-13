/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        brand: {
          deep: "#0F2A47",      // deep academic blue
          mid: "#1E4C75",       // owl body blue
          accent: "#3B82F6",    // highlight blue
        },
        background: {
          light: "#E6F0F6",     // soft page bg
          gradientFrom: "#E6F0F6",
          gradientTo: "#DCEAF4",
        },
        surface: {
          base: "#FFFFFF",
          subtle: "#F8FAFC",
        },
        accent: {
          orange: "#F97316",
        },
      },
      boxShadow: {
        soft: "0 8px 24px rgba(15, 42, 71, 0.08)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};