// ── Components ────────────────────────────────────────────────────────────────
export { default as StarRating }         from "./StarRating.jsx";
export { default }                       from "./StarRating.jsx";
export { default as RatingGroup }        from "./RatingGroup.jsx";
export { default as RatingDistribution } from "./RatingDistribution.jsx";
export { default as StarRatingInput }    from "./StarRatingInput.jsx";
export { default as StarRatingTooltip }  from "./StarRatingTooltip.jsx";
export { default as RatingBadge }        from "./RatingBadge.jsx";
export { default as RatingSummary }      from "./RatingSummary.jsx";
export { default as RatingWall }         from "./RatingWall.jsx";
export { default as RatingPrompt }       from "./RatingPrompt.jsx";

// ── Hooks ─────────────────────────────────────────────────────────────────────
export { useRating }             from "./useRating.js";
export { useRatingField }        from "./useRatingField.js";
export { useRatingAnalytics,
         useRatingGroupAnalytics} from "./useRatingAnalytics.js";
export { useRatingPersistence }  from "./useRatingPersistence.js";
export { useRatingExport }       from "./useRatingExport.js";

// ── Helpers ───────────────────────────────────────────────────────────────────
export { SHAPE_PATHS, getStarPath } from "./shapes.js";
export { getThemeVars, THEME_NAMES } from "./themes.js";
