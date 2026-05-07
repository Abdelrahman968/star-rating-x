import React, { forwardRef, useState } from "react";
import { getThemeVars } from "./themes.js";
import StarRating from "./StarRating.jsx";
import RatingDistribution from "./RatingDistribution.jsx";

/**
 * RatingSummary — complete review summary card.
 *
 * Combines: average score, star display, distribution bars, total count,
 * optional recent reviews list, and a "Write a review" CTA.
 *
 * Props:
 *  average        {number}              Overall average (e.g. 4.3)
 *  total          {number}              Total review count
 *  distribution   {Record<number,number>} e.g. { 5:720, 4:310, ... }
 *  reviews        {Array<ReviewItem>}   Optional list of recent reviews
 *  maxReviews     {number}              How many reviews to show (default 3)
 *  onWriteReview  {fn}                  CTA button callback
 *  writeReviewLabel {string}            CTA button text (default "Write a review")
 *  onFilter       {fn(star|null)}       Passed to RatingDistribution
 *  theme          {string}
 *  filledColor    {string}
 *  showDistribution {bool}             (default true)
 *  showReviews    {bool}               (default false)
 *  compact        {bool}               Smaller layout
 *  className      {string}
 *  style          {object}
 *
 * ReviewItem shape:
 *  { id, author, avatar, rating, title, text, date, verified }
 */
const RatingSummary = forwardRef(function RatingSummary(
  {
    average = 0,
    total = 0,
    distribution = {},
    reviews = [],
    maxReviews = 3,
    onWriteReview,
    writeReviewLabel = "Write a review",
    onFilter,
    theme = "gold",
    filledColor,
    showDistribution = true,
    showReviews = false,
    compact = false,
    className = "",
    style = {},
  },
  ref
) {
  const t = getThemeVars(theme);
  const color = filledColor || t.filled;
  const [activeFilter, setActiveFilter] = useState(null);

  const handleFilter = (star) => {
    setActiveFilter(star);
    onFilter?.(star);
  };

  const formatTotal = (n) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`;
    return n.toLocaleString();
  };

  const starPath =
    "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";

  return (
    <div
      ref={ref}
      className={`srx-summary ${className}`}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: compact ? 12 : 20,
        ...style,
      }}
    >
      {/* ── top: big score + stars + count ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: compact ? 12 : 20,
          flexWrap: "wrap",
        }}
      >
        {/* big number */}
        <div style={{ textAlign: "center", flexShrink: 0 }}>
          <div
            style={{
              fontSize: compact ? 40 : 56,
              fontWeight: 900,
              lineHeight: 1,
              color,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {average.toFixed(1)}
          </div>
          <div style={{ marginTop: 6 }}>
            <StarRating
              value={average}
              precision={0.5}
              readOnly
              size={compact ? 16 : 20}
              theme={theme}
              filledColor={filledColor}
              gap={3}
            />
          </div>
          {total > 0 && (
            <div
              style={{
                marginTop: 4,
                fontSize: 11,
                color: "#94a3b8",
                fontWeight: 500,
              }}
            >
              {formatTotal(total)} review{total !== 1 ? "s" : ""}
            </div>
          )}
        </div>

        {/* distribution bars */}
        {showDistribution && Object.keys(distribution).length > 0 && (
          <div style={{ flex: 1, minWidth: 160 }}>
            <RatingDistribution
              data={distribution}
              total={total}
              theme={theme}
              filledColor={filledColor}
              showCount={!compact}
              showPercent={compact}
              compact={compact}
              onFilter={handleFilter}
              activeFilter={activeFilter}
            />
          </div>
        )}
      </div>

      {/* ── CTA ── */}
      {onWriteReview && (
        <button
          onClick={onWriteReview}
          style={{
            alignSelf: "flex-start",
            padding: "9px 20px",
            borderRadius: 10,
            background: color + "18",
            border: `1.5px solid ${color}40`,
            color,
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            transition: "background 0.15s",
          }}
        >
          {writeReviewLabel}
        </button>
      )}

      {/* ── review list ── */}
      {showReviews && reviews.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            borderTop: "1px solid #1e293b",
            paddingTop: 16,
          }}
        >
          {reviews.slice(0, maxReviews).map((r, i) => (
            <div
              key={r.id ?? i}
              style={{
                padding: "14px 16px",
                borderRadius: 12,
                background: "#0f172a",
                border: "1px solid #1e293b",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {/* author row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                {/* avatar */}
                {r.avatar ? (
                  <img
                    src={r.avatar}
                    alt={r.author}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      objectFit: "cover",
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <span
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: color + "28",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      fontWeight: 700,
                      color,
                      flexShrink: 0,
                    }}
                  >
                    {(r.author ?? "?")[0].toUpperCase()}
                  </span>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#f1f5f9",
                      }}
                    >
                      {r.author ?? "Anonymous"}
                    </span>
                    {r.verified && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: "#34d399",
                          background: "#34d39918",
                          border: "1px solid #34d39930",
                          borderRadius: 999,
                          padding: "1px 7px",
                        }}
                      >
                        ✓ Verified
                      </span>
                    )}
                    <span
                      style={{
                        marginLeft: "auto",
                        fontSize: 11,
                        color: "#475569",
                      }}
                    >
                      {r.date}
                    </span>
                  </div>
                  <StarRating
                    value={r.rating}
                    precision={0.5}
                    readOnly
                    size={13}
                    theme={theme}
                    filledColor={filledColor}
                    gap={2}
                  />
                </div>
              </div>

              {/* title */}
              {r.title && (
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#e2e8f0",
                  }}
                >
                  {r.title}
                </p>
              )}

              {/* text */}
              {r.text && (
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    color: "#94a3b8",
                    lineHeight: 1.6,
                  }}
                >
                  {r.text}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default RatingSummary;
