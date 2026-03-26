import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      sm: "480px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        // Base escura — fundos da aplicação
        base: {
          950: "#0c0c0d",
          900: "#141415",
          800: "#1c1c1e",
          700: "#242426",
          600: "#2e2e31",
          500: "#3a3a3e",
        },

        // Off-white — accent principal
        offwhite: {
          50: "#f7f7f5",
          100: "#efefe9",
          200: "#e0e0d6",
          300: "#c8c8bb",
          400: "#a8a89a",
          DEFAULT: "#f0f0eb",
        },

        // Texto
        text: {
          primary: "#f0f0eb",
          secondary: "#a8a89a",
          muted: "#6b6b65",
          inverse: "#0c0c0d",
        },

        // Semânticas
        success: {
          DEFAULT: "#4ade80",
          subtle: "#052e16",
          text: "#86efac",
        },
        warning: {
          DEFAULT: "#fbbf24",
          subtle: "#1c1003",
          text: "#fde68a",
        },
        danger: {
          DEFAULT: "#f87171",
          subtle: "#1c0303",
          text: "#fca5a5",
        },

        // CSS variable-based tokens
        background: "var(--bg-page)",
        foreground: "var(--text-primary)",
        border: "var(--border-subtle)",
        ring: "var(--ring)",
        brand: {
          DEFAULT: "var(--brand)",
          hover: "var(--brand-hover)",
          muted: "var(--brand-muted)",
          subtle: "var(--brand-subtle)",
        },
      },
      fontFamily: {
        playfair: ["var(--font-playfair)", "serif"],
        inter: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      fontSize: {
        "display-lg": ["36px", { lineHeight: "1.2", fontWeight: "700" }],
        "display-md": ["28px", { lineHeight: "1.3", fontWeight: "600" }],
        "display-sm": ["22px", { lineHeight: "1.3", fontWeight: "600" }],
        heading: ["18px", { lineHeight: "1.4", fontWeight: "600" }],
        "body-lg": ["15px", { lineHeight: "1.6", fontWeight: "400" }],
        "body-md": ["13px", { lineHeight: "1.5", fontWeight: "400" }],
        "body-sm": ["11px", { lineHeight: "1.5", fontWeight: "400" }],
        "ui-md": ["13px", { lineHeight: "1", fontWeight: "500" }],
        "ui-sm": ["11px", { lineHeight: "1", fontWeight: "500" }],
        sku: ["12px", { lineHeight: "1.4", fontWeight: "500" }],
        measure: ["11px", { lineHeight: "1.4", fontWeight: "400" }],
      },
      borderRadius: {
        none: "0",
        sm: "4px",
        md: "6px",
        lg: "8px",
        xl: "12px",
        full: "9999px",
      },
      boxShadow: {
        card: "0 1px 1px 0 rgb(0 0 0 / 0.3), 0 0 0 1px #2e2e31",
        hover: "0 4px 20px 0 rgb(0 0 0 / 0.5)",
        modal: "0 20px 60px 0 rgb(0 0 0 / 0.7)",
        ring: "0 0 0 3px #f0f0eb40",
        "ring-danger": "0 0 0 3px #f8717140",
        sm: "0 1px 3px 0 rgb(0 0 0 / 0.4)",
        md: "0 4px 12px 0 rgb(0 0 0 / 0.5)",
        lg: "0 8px 30px 0 rgb(0 0 0 / 0.6)",
      },
      spacing: {
        1: "4px",
        2: "8px",
        3: "12px",
        4: "16px",
        5: "20px",
        6: "24px",
        8: "32px",
        12: "48px",
      },
      keyframes: {
        "slide-up": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "slide-up": "slide-up 200ms ease-out",
        shimmer: "shimmer 1.5s ease-in-out infinite",
      },
      maxWidth: {
        content: "1440px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
