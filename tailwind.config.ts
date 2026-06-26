import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ISM brand identity (extracted from logo / key visual)
        ism: {
          green: "#2E9E3F",
          "green-600": "#268A37",
          "green-700": "#1E7A30",
          "green-800": "#155E26",
          "green-900": "#103F1D",
          gold: "#F4B740",
          "gold-600": "#E3A52E",
          red: "#E2231A",
          mist: "#EAF4EC",
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      boxShadow: {
        float: "0 18px 50px -12px rgba(16, 63, 29, 0.28)",
        card: "0 4px 24px -8px rgba(16, 63, 29, 0.12)",
        glow: "0 0 0 1px rgba(46,158,63,0.12), 0 12px 32px -12px rgba(46,158,63,0.35)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-up": "fade-up .5s cubic-bezier(.22,1,.36,1) both",
        "scale-in": "scale-in .4s cubic-bezier(.22,1,.36,1) both",
      },
    },
  },
  plugins: [],
};
export default config;
