import React, { forwardRef } from "react";
import { getThemeVars } from "./themes.js";

/**
 * RatingBadge — compact inline badge showing average + count.
 *
 * Props:
 *  value      {number}  Average rating (e.g. 4.8)
 *  count      {number}  Total review count
 *  max        {number}  Max stars (default 5)
 *  theme      {string}  Colour theme
 *  filledColor{string}  Override star colour
 *  size       {'xs'|'sm'|'md'|'lg'}  Badge size (default 'md')
 *  showStar   {bool}    Show star icon (default true)
 *  showCount  {bool}    Show review count (default true)
 *  compact    {bool}    Ultra-compact — just "⭐ 4.8" (default false)
 *  pill       {bool}    Pill/rounded background (default true)
 *  onClick    {fn}
 *  className  {string}
 *  style      {object}
 */
const RatingBadge = forwardRef(function RatingBadge(
  {
    value = 0,
    count,
    max = 5,
    theme = "gold",
    filledColor,
    size = "md",
    showStar = true,
    showCount = true,
    compact = false,
    pill = true,
    onClick,
    className = "",
    style = {},
  },
  ref
) {
  const t = getThemeVars(theme);
  const color = filledColor || t.filled;

  const SIZES = {
    xs: { fontSize: 10, starSize: 10, px: 6,  py: 2 },
    sm: { fontSize: 12, starSize: 12, px: 8,  py: 3 },
    md: { fontSize: 13, starSize: 14, px: 10, py: 4 },
    lg: { fontSize: 15, starSize: 16, px: 14, py: 6 },
  };
  const s = SIZES[size] ?? SIZES.md;

  const formatCount = (n) => {
    if (!n && n !== 0) return null;
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`;
    return n.toLocaleString();
  };

  const starPath =
    "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";

  return (
    <span
      ref={ref}
      className={`srx-badge ${className}`}
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        paddingTop:    s.py,
        paddingBottom: s.py,
        paddingLeft:   s.px,
        paddingRight:  s.px,
        borderRadius: pill ? 999 : 6,
        background: color + "18",
        border: `1px solid ${color}30`,
        cursor: onClick ? "pointer" : "default",
        fontWeight: 700,
        fontSize: s.fontSize,
        lineHeight: 1,
        userSelect: "none",
        ...style,
      }}
      title={count ? `${value} out of ${max} (${count} reviews)` : `${value} out of ${max}`}
    >
      {showStar && (
        <svg
          viewBox="0 0 24 24"
          width={s.starSize}
          height={s.starSize}
          aria-hidden
        >
          <path d={starPath} fill={color} stroke="none" />
        </svg>
      )}
      <span style={{ color }}>{typeof value === "number" ? value.toFixed(1) : value}</span>
      {!compact && showCount && count !== undefined && (
        <span style={{ color: color, opacity: 0.6, fontSize: s.fontSize * 0.88 }}>
          ({formatCount(count)})
        </span>
      )}
    </span>
  );
});

export default RatingBadge;
