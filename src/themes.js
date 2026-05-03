/**
 * Built-in themes for StarRatingX.
 * Each theme exports filled, empty, stroke colours and optional CSS vars.
 */
const themes = {
  gold: {
    filled: "#FBBF24",
    empty: "#E5E7EB",
    stroke: "#F59E0B",
  },
  fire: {
    filled: "#EF4444",
    empty: "#FEE2E2",
    stroke: "#B91C1C",
  },
  ocean: {
    filled: "#3B82F6",
    empty: "#DBEAFE",
    stroke: "#1D4ED8",
  },
  neon: {
    filled: "#A3E635",
    empty: "#1a1a1a",
    stroke: "#65A30D",
  },
  rose: {
    filled: "#EC4899",
    empty: "#FCE7F3",
    stroke: "#BE185D",
  },
  mono: {
    filled: "#1F2937",
    empty: "#D1D5DB",
    stroke: "#374151",
  },
  violet: {
    filled: "#8B5CF6",
    empty: "#EDE9FE",
    stroke: "#6D28D9",
  },
  sunset: {
    filled: "#F97316",
    empty: "#FFEDD5",
    stroke: "#C2410C",
  },
  mint: {
    filled: "#10B981",
    empty: "#D1FAE5",
    stroke: "#059669",
  },
};

export function getThemeVars(themeName = "gold") {
  const t = themes[themeName] ?? themes.gold;
  return {
    filled: t.filled,
    empty: t.empty,
    stroke: t.stroke,
    cssVars: {},
  };
}

export const THEME_NAMES = Object.keys(themes);
