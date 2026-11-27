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
          50: "#FBF8F1",
          100: "#F6EEDC",
          200: "#EFE0BF",
          300: "#F5E1B8",
          400: "#E6C27A",
          500: "#D4A853", // Institutional Bullion Gold
          600: "#B88B36", // Brushed Metallic Gold
          700: "#8F6A25",
          800: "#664B1A",
          900: "#3D2D10",
        },
        dark: {
          base: "#09090B",
          card: "#0F1014",
          elevated: "#16181F",
          border: "#232632",
          hover: "#1D202A",
        },
        fintech: {
          green: "#10B981",
          greenSoft: "rgba(16, 185, 129, 0.12)",
          red: "#F43F5E",
          redSoft: "rgba(244, 63, 94, 0.12)",
          cyan: "#38BDF8",
        }
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "SF Mono", "Fira Code", "monospace"],
      },
      boxShadow: {
        'gold-glow': '0 0 28px -6px rgba(212, 168, 83, 0.24)',
        'gold-subtle': '0 0 16px -4px rgba(212, 168, 83, 0.12)',
        'green-glow': '0 0 20px -5px rgba(16, 185, 129, 0.25)',
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
