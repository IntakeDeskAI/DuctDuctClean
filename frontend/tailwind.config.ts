import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#E8F4FD",
          100: "#C8E2F5",
          200: "#9ECBEB",
          300: "#6BADE0",
          400: "#3D8FD4",
          500: "#2570B5",
          600: "#1B4D7A",
          700: "#174268",
          800: "#123556",
          900: "#0D2844",
          950: "#081A2E",
        },
        accent: {
          50: "#EAFAF1",
          100: "#D5F5E3",
          200: "#ABEBC6",
          300: "#82E0AA",
          400: "#58D68D",
          500: "#2ECC71",
          600: "#27AE60",
          700: "#1E8449",
          800: "#196F3D",
          900: "#145A32",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Poppins", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
