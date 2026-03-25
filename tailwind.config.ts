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
        casino: {
          black:     "#0a0c0e",
          dark:      "#0f1214",
          surface:   "#161a1e",
          border:    "#252b31",
          felt:      "#1a5c30",
          "felt-mid":"#16512a",
          "felt-dark":"#112a17",
          gold:      "#d4af37",
          "gold-dim":"#9a7d20",
          "gold-light":"#f0cc5e",
          red:       "#c0392b",
          "red-bright":"#e74c3c",
          chip: {
            white:  "#f5f5f5",
            red:    "#e74c3c",
            green:  "#2ecc71",
            black:  "#2c3e50",
            purple: "#9b59b6",
          },
        },
      },
      fontFamily: {
        display: ["Georgia", "serif"],
        mono:    ["'Courier New'", "monospace"],
      },
      boxShadow: {
        card:   "0 4px 16px rgba(0,0,0,0.6), 0 1px 3px rgba(0,0,0,0.4)",
        "card-glow": "0 0 20px rgba(212,175,55,0.3), 0 4px 16px rgba(0,0,0,0.6)",
        table:  "inset 0 0 80px rgba(0,0,0,0.5), 0 0 40px rgba(0,0,0,0.8)",
        chip:   "0 3px 8px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.15)",
        glow:   "0 0 30px rgba(212,175,55,0.4)",
        "glow-red": "0 0 30px rgba(231,76,60,0.5)",
        "glow-green": "0 0 30px rgba(46,204,113,0.4)",
      },
      keyframes: {
        "deal-in": {
          "0%":   { transform: "translateY(-120px) scale(0.7) rotate(-5deg)", opacity: "0" },
          "100%": { transform: "translateY(0) scale(1) rotate(0deg)", opacity: "1" },
        },
        "flip-card": {
          "0%":   { transform: "rotateY(90deg)" },
          "100%": { transform: "rotateY(0deg)" },
        },
        "chip-in": {
          "0%":   { transform: "scale(0) rotate(-180deg)", opacity: "0" },
          "100%": { transform: "scale(1) rotate(0deg)", opacity: "1" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 10px rgba(212,175,55,0.3)" },
          "50%":       { boxShadow: "0 0 25px rgba(212,175,55,0.7)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":       { transform: "translateY(-8px)" },
        },
      },
      animation: {
        "deal-in":    "deal-in 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards",
        "flip-card":  "flip-card 0.3s ease-out forwards",
        "chip-in":    "chip-in 0.25s cubic-bezier(0.34,1.56,0.64,1) forwards",
        shimmer:      "shimmer 2.5s linear infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        float:        "float 3s ease-in-out infinite",
      },
      backgroundImage: {
        "felt-radial": "radial-gradient(ellipse at center, #1e6b36 0%, #164d28 50%, #0e3019 100%)",
        "gold-shine":  "linear-gradient(135deg, #b8960c 0%, #f0cc5e 50%, #b8960c 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
