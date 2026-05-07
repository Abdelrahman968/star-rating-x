import * as React from "react";

// ── Shapes ────────────────────────────────────────────────────────────────────
export type StarShape =
  | "star" | "heart" | "circle" | "diamond"
  | "thumb" | "flag"  | "lightning" | "flower";

// ── Themes ────────────────────────────────────────────────────────────────────
export type ThemeName =
  | "gold" | "fire" | "ocean" | "neon" | "rose"
  | "mono" | "violet" | "sunset" | "mint";

// ── Animations ────────────────────────────────────────────────────────────────
export type AnimationType = "bounce" | "pulse" | "wiggle" | "pop" | "none";

// ── Icon render context ───────────────────────────────────────────────────────
export interface IconRenderContext {
  fill: number;        // 0 | 0.5 | 1
  fillColor: string;   // resolved fill colour / gradient url
  index: number;
  size: number;
  filled: string;      // resolved filled colour
  empty: string;       // resolved empty colour
}

// ── Character render context ──────────────────────────────────────────────────
export interface CharacterRenderContext {
  fill: number;
  index: number;
  filled: string;
  empty: string;
}

// ── StarRating Props ──────────────────────────────────────────────────────────
export interface StarRatingProps {
  // state
  value?: number;
  defaultValue?: number;
  count?: number;
  precision?: 1 | 0.5;

  // appearance
  size?: number | string;
  gap?: number;
  shape?: StarShape;
  theme?: ThemeName;
  filledColor?: string;
  emptyColor?: string;
  strokeColor?: string;
  strokeWidth?: number;

  /**
   * Render an emoji, text, or custom element instead of the built-in SVG icon.
   * @example character="😊"
   * @example character={({ fill }) => <MyIcon opacity={fill} />}
   */
  character?: string | ((ctx: CharacterRenderContext) => React.ReactNode);

  /**
   * Replace the built-in SVG shape with a custom SVG path string or render fn.
   * @example customIcon="M12 2 L15 9 L22 9…"
   * @example customIcon={({ fillColor, size }) => <svg>…</svg>}
   */
  customIcon?: string | ((ctx: IconRenderContext) => React.ReactNode);

  /** Animate stars filling up on first mount */
  mountAnimation?: boolean;
  /** Duration of mount animation in ms (default 800) */
  mountDuration?: number;
  /** v4 — two-stop gradient fill e.g. ["#FBBF24","#F97316"] */
  filledGradient?: string[];
  /** v4 — gradient direction (default "horizontal") */
  gradientDirection?: "horizontal" | "vertical" | "diagonal";
  /** v4 — ghost comparison value displayed behind the main stars */
  compareValue?: number;
  /** v4 — label next to compareValue (default "avg") */
  compareLabel?: string;
  /** v4 — confetti burst when the user selects the maximum rating */
  celebrateOnMax?: boolean;
  /** v4 — colours used for confetti particles */
  confettiColors?: string[];

  // behaviour
  readOnly?: boolean;
  disabled?: boolean;
  allowClear?: boolean;
  showValue?: boolean;
  tooltips?: string[];
  animation?: AnimationType;
  direction?: "ltr" | "rtl";
  highlightSelected?: boolean;

  // a11y
  label?: string;

  // callbacks
  onChange?: (value: number) => void;
  onHoverChange?: (value: number | null) => void;

  className?: string;
  style?: React.CSSProperties;
}

export declare const StarRating: React.ForwardRefExoticComponent<
  StarRatingProps & React.RefAttributes<HTMLSpanElement>
>;

export default StarRating;

// ── RatingGroup ───────────────────────────────────────────────────────────────
export interface RatingCategory {
  /** Unique identifier used as the key in the values map */
  key: string;
  /** Human-readable label shown next to the stars */
  label: string;
}

export interface RatingGroupProps extends Omit<StarRatingProps, "value" | "defaultValue" | "onChange" | "showValue"> {
  categories: RatingCategory[];
  /** Controlled values map — { [key]: number } */
  values?: Record<string, number>;
  /** Uncontrolled initial values */
  defaultValues?: Record<string, number>;
  /** Called whenever any category rating changes */
  onChange?: (key: string, value: number, allValues: Record<string, number>) => void;
  /** Show an average row at the bottom */
  showAverage?: boolean;
  /** Text for the average row (default "Overall") */
  overallLabel?: string;
  /** Precision of the average stars (default 0.5) */
  averagePrecision?: 1 | 0.5;
  /** Show numeric value next to each row's stars */
  showValues?: boolean;
  /** Width of the label column in px (default 120) */
  labelWidth?: number;
  /** Gap between rows in px (default 12) */
  rowGap?: number;
  /** Colour of the divider line above the average row */
  dividerColor?: string;
  /** Extra CSSProperties for the overall label span */
  averageLabelStyle?: React.CSSProperties;
}

export declare const RatingGroup: React.ForwardRefExoticComponent<
  RatingGroupProps & React.RefAttributes<HTMLDivElement>
>;

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


// ─── RatingBadge ──────────────────────────────────────────────────────────────

export type BadgeSize = "xs" | "sm" | "md" | "lg";

export interface RatingBadgeProps {
  value?: number | string;
  count?: number;
  max?: number;
  theme?: ThemeName;
  filledColor?: string;
  size?: BadgeSize;
  showStar?: boolean;
  showCount?: boolean;
  compact?: boolean;
  pill?: boolean;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export declare const RatingBadge: React.ForwardRefExoticComponent<
  RatingBadgeProps & React.RefAttributes<HTMLSpanElement>
>;

// ─── RatingSummary ────────────────────────────────────────────────────────────

export interface ReviewItem {
  id?: string | number;
  author?: string;
  avatar?: string;
  rating: number;
  title?: string;
  text?: string;
  date?: string;
  verified?: boolean;
  helpful?: number;
}

export interface RatingSummaryProps {
  average?: number;
  total?: number;
  distribution?: Record<number, number>;
  reviews?: ReviewItem[];
  maxReviews?: number;
  onWriteReview?: () => void;
  writeReviewLabel?: string;
  onFilter?: (star: number | null) => void;
  theme?: ThemeName;
  filledColor?: string;
  showDistribution?: boolean;
  showReviews?: boolean;
  compact?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export declare const RatingSummary: React.ForwardRefExoticComponent<
  RatingSummaryProps & React.RefAttributes<HTMLDivElement>
>;

// ─── RatingWall ───────────────────────────────────────────────────────────────

export interface RatingWallProps {
  reviews?: ReviewItem[];
  columns?: number;
  maxItems?: number;
  showMore?: boolean;
  pageSize?: number;
  theme?: ThemeName;
  filledColor?: string;
  sortBy?: "recent" | "highest" | "lowest" | "helpful";
  filterStar?: number | null;
  onHelpful?: (review: ReviewItem) => void;
  emptyText?: string;
  className?: string;
  style?: React.CSSProperties;
}

export declare const RatingWall: React.ForwardRefExoticComponent<
  RatingWallProps & React.RefAttributes<HTMLDivElement>
>;

// ─── RatingPrompt ─────────────────────────────────────────────────────────────

export type PromptTrigger = "time" | "scroll" | "action";
export type PromptPlacement = "bottom-right" | "bottom-left" | "bottom-center" | "center";

export interface RatingPromptProps {
  trigger?: PromptTrigger;
  delay?: number;
  scrollPercent?: number;
  visible?: boolean;
  message?: string;
  subMessage?: string;
  onRate?: (value: number) => void;
  onDismiss?: () => void;
  onLater?: () => void;
  showLater?: boolean;
  laterLabel?: string;
  dismissLabel?: string;
  submitLabel?: string;
  placement?: PromptPlacement;
  theme?: ThemeName;
  count?: number;
  size?: number;
  animation?: AnimationType;
  rememberDismiss?: boolean;
  storageKey?: string;
  className?: string;
  style?: React.CSSProperties;
}

export declare const RatingPrompt: React.ForwardRefExoticComponent<
  RatingPromptProps & React.RefAttributes<HTMLDivElement>
>;

// ─── useRatingAnalytics ───────────────────────────────────────────────────────

export interface AnalyticsResult {
  count: number;
  average: number;
  median: number;
  mode: number;
  min: number;
  max: number;
  stdDev: number;
  nps: number;
  trend: "improving" | "stable" | "declining";
  recentTrend: "improving" | "stable" | "declining";
  percentPositive: number;
  percentNegative: number;
  percentNeutral: number;
  distribution: Record<number, number>;
  distributionPercent: Record<number, number>;
  topScore: number;
  bottomScore: number;
}

export interface AnalyticsOptions {
  max?: number;
  positiveMin?: number;
  negativeMax?: number;
}

export declare function useRatingAnalytics(
  ratings: number[],
  options?: AnalyticsOptions
): AnalyticsResult;

export interface GroupAnalyticsResult {
  [key: string]: { average: number; count: number } | string | number;
  topRated: string | null;
  weakestRated: string | null;
  overallAverage: number;
}

export declare function useRatingGroupAnalytics(
  categoryRatings: Record<string, number[]>,
  options?: AnalyticsOptions
): GroupAnalyticsResult;

// ─── useRatingPersistence ─────────────────────────────────────────────────────

export interface UseRatingPersistenceOptions {
  defaultValue?: number;
  ttl?: number;
  namespace?: string;
  onLoad?: (value: number) => void;
  onChange?: (value: number) => void;
}

export interface UseRatingPersistenceResult {
  value: number;
  onChange: (value: number) => void;
  reset: () => void;
  isLoaded: boolean;
  storedAt: number | null;
}

export declare function useRatingPersistence(
  key: string,
  options?: UseRatingPersistenceOptions
): UseRatingPersistenceResult;

// ─── useRatingExport ──────────────────────────────────────────────────────────

export interface UseRatingExportOptions {
  filename?: string;
  csvFields?: string[];
}

export interface UseRatingExportResult {
  exportCSV: () => void;
  exportJSON: () => void;
  copyJSON: () => Promise<boolean>;
}

export declare function useRatingExport(
  data: Record<string, unknown>[],
  options?: UseRatingExportOptions
): UseRatingExportResult;

// ─── v5 StarRating additions ──────────────────────────────────────────────────

// These props are added to StarRatingProps in v5:
// glowEffect?: boolean
// glowIntensity?: number
// loading?: boolean
// onRatingComplete?: (value: number) => void
// debounceMs?: number
// allowUndo?: boolean
// undoTimeout?: number
// onUndo?: (previousValue: number) => void
