import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "rgb(var(--surface) / <alpha-value>)",
        panel: "rgb(var(--panel) / <alpha-value>)",
        panelSoft: "rgb(var(--panel-soft) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        brand: "rgb(var(--brand) / <alpha-value>)",
        success: "rgb(var(--success) / <alpha-value>)",
        danger: "rgb(var(--danger) / <alpha-value>)",
      },
      boxShadow: {
        soft: "0 24px 80px rgb(0 0 0 / 0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
