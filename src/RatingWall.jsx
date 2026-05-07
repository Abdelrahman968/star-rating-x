import React, { forwardRef, useState } from "react";
import { getThemeVars } from "./themes.js";
import StarRating from "./StarRating.jsx";

/**
 * RatingWall — masonry/grid display of review cards.
 *
 * Props:
 *  reviews     {ReviewItem[]}  Array of review objects
 *  columns     {number}        Grid columns (default 3, responsive on small screens)
 *  maxItems    {number}        Max reviews to show initially (default 9)
 *  showMore    {bool}          Show "Load more" button (default true)
 *  pageSize    {number}        Items per "load more" (default 6)
 *  theme       {string}
 *  filledColor {string}
 *  sortBy      {'recent'|'highest'|'lowest'|'helpful'}
 *  filterStar  {number|null}   Show only this star level
 *  onHelpful   {fn(review)}    Called when "Helpful" is clicked
 *  emptyText   {string}        Shown when no reviews match filter
 *  className   {string}
 *  style       {object}
 *
 * ReviewItem:
 *  { id, author, avatar, rating, title, text, date, verified, helpful? }
 */
const RatingWall = forwardRef(function RatingWall(
  {
    reviews = [],
    columns = 3,
    maxItems = 9,
    showMore = true,
    pageSize = 6,
    theme = "gold",
    filledColor,
    sortBy = "recent",
    filterStar = null,
    onHelpful,
    emptyText = "No reviews yet. Be the first to review!",
    className = "",
    style = {},
  },
  ref
) {
  const t = getThemeVars(theme);
  const color = filledColor || t.filled;
  const [visible, setVisible] = useState(maxItems);
  const [helpfulIds, setHelpfulIds] = useState(new Set());

  // sort
  const sorted = [...reviews].sort((a, b) => {
    if (sortBy === "highest") return b.rating - a.rating;
    if (sortBy === "lowest")  return a.rating - b.rating;
    if (sortBy === "helpful") return (b.helpful ?? 0) - (a.helpful ?? 0);
    // recent — assume higher index = more recent, or use date string
    return 0;
  });

  // filter
  const filtered = filterStar !== null
    ? sorted.filter(r => Math.round(r.rating) === filterStar)
    : sorted;

  const shown = filtered.slice(0, visible);

  const handleHelpful = (review) => {
    if (helpfulIds.has(review.id)) return;
    setHelpfulIds(prev => new Set([...prev, review.id]));
    onHelpful?.(review);
  };

  const starPath =
    "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";

  if (filtered.length === 0) {
    return (
      <div
        ref={ref}
        className={className}
        style={{
          textAlign: "center",
          padding: "40px 20px",
          color: "#64748b",
          fontSize: 14,
          ...style,
        }}
      >
        {emptyText}
      </div>
    );
  }

  return (
    <div ref={ref} className={`srx-wall ${className}`} style={{ ...style }}>
      {/* grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: 16,
        }}
      >
        {shown.map((review, i) => (
          <ReviewCard
            key={review.id ?? i}
            review={review}
            color={color}
            theme={theme}
            filledColor={filledColor}
            isHelpful={helpfulIds.has(review.id)}
            onHelpful={onHelpful ? () => handleHelpful(review) : null}
          />
        ))}
      </div>

      {/* load more */}
      {showMore && visible < filtered.length && (
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <button
            onClick={() => setVisible(v => v + pageSize)}
            style={{
              padding: "10px 28px",
              borderRadius: 10,
              background: color + "18",
              border: `1.5px solid ${color}30`,
              color,
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              transition: "background 0.15s",
            }}
          >
            Load more ({filtered.length - visible} remaining)
          </button>
        </div>
      )}
    </div>
  );
});

function ReviewCard({ review, color, theme, filledColor, isHelpful, onHelpful }) {
  const COLORS = {
    1: "#ef4444", 2: "#f97316", 3: "#eab308", 4: "#22c55e", 5: "#10b981",
  };
  const ratingColor = COLORS[Math.round(review.rating)] ?? color;

  return (
    <div
      style={{
        padding: "16px",
        borderRadius: 14,
        border: "1px solid #1e293b",
        background: "#0f172a",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        height: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        {/* avatar */}
        {review.avatar ? (
          <img
            src={review.avatar}
            alt={review.author}
            style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
          />
        ) : (
          <span
            style={{
              width: 36, height: 36, borderRadius: "50%",
              background: ratingColor + "28",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 800, color: ratingColor, flexShrink: 0,
            }}
          >
            {(review.author ?? "?")[0].toUpperCase()}
          </span>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {review.author ?? "Anonymous"}
            </span>
            {review.verified && (
              <span style={{ fontSize: 9, fontWeight: 700, color: "#34d399", background: "#34d39918", border: "1px solid #34d39930", borderRadius: 999, padding: "1px 6px", flexShrink: 0 }}>
                ✓
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
            <StarRating value={review.rating} precision={0.5} readOnly size={12} theme={theme} filledColor={filledColor} gap={1} />
            <span style={{ fontSize: 10, color: "#475569", flexShrink: 0 }}>{review.date}</span>
          </div>
        </div>

        {/* rating badge */}
        <span
          style={{
            flexShrink: 0,
            width: 30, height: 30, borderRadius: 8,
            background: ratingColor + "20",
            border: `1px solid ${ratingColor}30`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 800, color: ratingColor,
          }}
        >
          {review.rating % 1 === 0 ? review.rating : review.rating.toFixed(1)}
        </span>
      </div>

      {/* title */}
      {review.title && (
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#e2e8f0", lineHeight: 1.4 }}>
          {review.title}
        </p>
      )}

      {/* text */}
      {review.text && (
        <p style={{ margin: 0, fontSize: 12, color: "#94a3b8", lineHeight: 1.65, flex: 1 }}>
          {review.text}
        </p>
      )}

      {/* helpful */}
      {onHelpful && (
        <button
          onClick={onHelpful}
          disabled={isHelpful}
          style={{
            alignSelf: "flex-start",
            marginTop: "auto",
            padding: "4px 12px",
            borderRadius: 8,
            background: isHelpful ? "#34d39918" : "transparent",
            border: `1px solid ${isHelpful ? "#34d39930" : "#1e293b"}`,
            color: isHelpful ? "#34d399" : "#64748b",
            fontSize: 11,
            fontWeight: 600,
            cursor: isHelpful ? "default" : "pointer",
            transition: "all 0.15s",
          }}
        >
          {isHelpful ? "✓ Helpful" : `👍 Helpful${review.helpful ? ` (${review.helpful})` : ""}`}
        </button>
      )}
    </div>
  );
}

export default RatingWall;
