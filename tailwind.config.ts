import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: "#FFFDF0",
          100: "#FFF9C2",
          200: "#FFF28A",
          300: "#FFE94D",
          400: "#FFDF1A",
          500: "#FFD700", // Gold Star Brand Gold
          600: "#D4AF37", // Metallic Gold
          700: "#AA8C2C",
          800: "#7F6921",
          900: "#554616",
        },
        dark: {
          base: "#07080B",
          card: "#0D0F15",
          elevated: "#131722",
          border: "#1C2230",
          hover: "#1A202E",
        },
        fintech: {
          green: "#00C087",
          greenSoft: "rgba(0, 192, 135, 0.12)",
          red: "#FF3B56",
          redSoft: "rgba(255, 59, 86, 0.12)",
          cyan: "#00E5FF",
        }
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "SF Mono", "Fira Code", "monospace"],
      },
      boxShadow: {
        'gold-glow': '0 0 25px -5px rgba(255, 215, 0, 0.25)',
        'gold-subtle': '0 0 15px -3px rgba(255, 215, 0, 0.12)',
        'green-glow': '0 0 20px -5px rgba(0, 192, 135, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      }
    },
  },
  plugins: [],
};
export default config;
