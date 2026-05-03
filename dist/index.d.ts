import * as React from "react";

// ── Shapes ────────────────────────────────────────────────────────────────────
export type StarShape =
  | "star"
  | "heart"
  | "circle"
  | "diamond"
  | "thumb"
  | "flag"
  | "lightning"
  | "flower";

// ── Themes ────────────────────────────────────────────────────────────────────
export type ThemeName =
  | "gold"
  | "fire"
  | "ocean"
  | "neon"
  | "rose"
  | "mono"
  | "violet"
  | "sunset"
  | "mint";

// ── Animations ────────────────────────────────────────────────────────────────
export type AnimationType = "bounce" | "pulse" | "wiggle" | "pop" | "none";

// ── StarRating Props ──────────────────────────────────────────────────────────
export interface StarRatingProps {
  /** Controlled value (0 – count) */
  value?: number;
  /** Uncontrolled initial value */
  defaultValue?: number;
  /** Total number of stars (default 5) */
  count?: number;
  /** Rating precision – 1 (whole) or 0.5 (half-star) */
  precision?: 1 | 0.5;
  /** Star size in px (default 32) */
  size?: number | string;
  /** Gap between stars in px (default 6) */
  gap?: number;
  /** Icon shape */
  shape?: StarShape;
  /** Preset colour theme */
  theme?: ThemeName;
  /** Override the filled star colour */
  filledColor?: string;
  /** Override the empty star colour */
  emptyColor?: string;
  /** Override the stroke colour */
  strokeColor?: string;
  /** SVG stroke width (default 1.5) */
  strokeWidth?: number;
  /** Disable interaction (keeps styling) */
  readOnly?: boolean;
  /** Fully disable + grey-out */
  disabled?: boolean;
  /** Clicking the currently-selected value resets to 0 (default true) */
  allowClear?: boolean;
  /** Show the numeric value label next to the stars */
  showValue?: boolean;
  /** Custom tooltip labels, one per star */
  tooltips?: string[];
  /** Click animation style */
  animation?: AnimationType;
  /** Layout direction */
  direction?: "ltr" | "rtl";
  /** Highlight ring on the selected star */
  highlightSelected?: boolean;
  /** Accessible ARIA label (default "Rating") */
  label?: string;
  /** Called with the new value when user selects */
  onChange?: (value: number) => void;
  /** Called with hovered value, or null when cursor leaves */
  onHoverChange?: (value: number | null) => void;
  className?: string;
  style?: React.CSSProperties;
}

// ── Component ─────────────────────────────────────────────────────────────────
export declare const StarRating: React.ForwardRefExoticComponent<
  StarRatingProps & React.RefAttributes<HTMLSpanElement>
>;

export default StarRating;

// ── useRating hook ────────────────────────────────────────────────────────────
export interface UseRatingOptions {
  initialValue?: number;
  count?: number;
  precision?: 1 | 0.5;
  onChange?: (value: number) => void;
}

export interface UseRatingResult {
  value: number;
  hoverValue: number | null;
  set: (value: number) => void;
  reset: () => void;
  handlers: {
    onChange: (value: number) => void;
    onHoverChange: (value: number | null) => void;
  };
}

export declare function useRating(options?: UseRatingOptions): UseRatingResult;

// ── Helpers ───────────────────────────────────────────────────────────────────
export declare const SHAPE_PATHS: Record<StarShape, string>;
export declare function getStarPath(shape?: StarShape): string;

export declare const THEME_NAMES: ThemeName[];
export declare function getThemeVars(themeName?: ThemeName): {
  filled: string;
  empty: string;
  stroke: string;
  cssVars: Record<string, string>;
};
