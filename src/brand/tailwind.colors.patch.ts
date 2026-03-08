// PATCH: Tailwind tokens should reference CSS variables from homi-colors.css
export const HOMI_TAILWIND_COLORS = {
  brand: {
    cyan: "var(--cyan)",
    emerald: "var(--emerald)",
    yellow: "var(--yellow)"
  },
  verdict: {
    ready: "var(--verdict-ready)",
    almost: "var(--verdict-almost)",
    build: "var(--verdict-build)",
    stop: "var(--verdict-stop)"
  },
  surface: {
    0: "var(--navy-dark)",
    1: "var(--navy)",
    2: "var(--navy-light)",
    3: "var(--slate)",
    4: "var(--slate-light)"
  },
  text: {
    1: "var(--light)",
    2: "var(--light-dim)",
    3: "rgba(255,255,255,0.4)",
    4: "rgba(255,255,255,0.2)"
  }
} as const
