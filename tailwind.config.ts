import type { Config } from "tailwindcss";

/**
 * Design System — Essência em Diálogo
 * Paleta definitiva aprovada (ver docs/DESIGN_SYSTEM.md):
 * carvão profundo, preto quente, azul-petróleo quase preto,
 * marfim quente, bronze/cobre, terracota controlado.
 *
 * Os tokens vivem como CSS variables em src/styles/tokens.css
 * e são referenciados aqui — nunca hardcodar HEX em componentes.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        charcoal: "var(--color-charcoal)",
        "warm-black": "var(--color-warm-black)",
        petrol: "var(--color-petrol)",
        ivory: "var(--color-ivory)",
        bronze: "var(--color-bronze)",
        terracotta: "var(--color-terracotta)",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "var(--radius-md)",
      },
    },
  },
  plugins: [],
};

export default config;
