import React, { forwardRef, useMemo } from "react";
import { getThemeVars } from "./themes.js";

/**
 * RatingDistribution — Amazon/Google-style rating breakdown bar chart.
 *
 * Props:
 *  data         {Record<number,number>}  e.g. { 5:120, 4:80, 3:30, 2:10, 1:5 }
 *  total        {number}                 Override total count (default: sum of data)
 *  count        {number}                 Max star level (default 5)
 *  theme        {string}                 Colour theme
 *  filledColor  {string}                 Override bar colour
 *  showCount    {boolean}                Show raw count per row (default true)
 *  showPercent  {boolean}                Show percent per row (default false)
 *  average      {number}                 Display overall average (optional)
 *  onFilter     {fn(star)}               Called when a row is clicked for filtering
 *  activeFilter {number|null}            Currently active filter star
 *  compact      {boolean}               Smaller layout (default false)
 *  animate      {boolean}               Animate bars on mount (default true)
 *  className    {string}
 *  style        {object}
 */
const RatingDistribution = forwardRef(function RatingDistribution(
  {
    data = {},
    total: totalOverride,
    count = 5,
    theme = "gold",
    filledColor,
    showCount = true,
    showPercent = false,
    average,
    onFilter,
    activeFilter = null,
    compact = false,
    animate = true,
    className = "",
    style = {},
  },
  ref
) {
  const themeVars = getThemeVars(theme);
  const barColor  = filledColor || themeVars.filled;
  const emptyColor = themeVars.empty;

  const total = useMemo(() => {
    if (totalOverride) return totalOverride;
    return Object.values(data).reduce((s, v) => s + (v || 0), 0);
  }, [data, totalOverride]);

  const computedAvg = useMemo(() => {
    if (average !== undefined) return average;
    if (total === 0) return 0;
    let sum = 0;
    for (let i = 1; i <= count; i++) sum += i * (data[i] || 0);
    return sum / total;
  }, [average, data, count, total]);

  const rows = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => count - i).map((star) => ({
        star,
        count: data[star] || 0,
        pct: total > 0 ? ((data[star] || 0) / total) * 100 : 0,
      })),
    [data, count, total]
  );

  const starPath =
    "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";

  const sz = compact ? 12 : 14;

  return (
    <div
      ref={ref}
      className={`srx-dist ${className}`}
      style={{ display: "flex", flexDirection: "column", gap: compact ? 6 : 8, ...style }}
    >
      {/* optional average summary */}
      {!compact && total > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 8,
            marginBottom: 4,
          }}
        >
          <span
            style={{
              fontSize: 36,
              fontWeight: 900,
              lineHeight: 1,
              color: barColor,
            }}
          >
            {computedAvg.toFixed(1)}
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* mini stars */}
            <span style={{ display: "flex", gap: 2 }}>
              {Array.from({ length: count }, (_, i) => {
                const f = computedAvg - i;
                return (
                  <svg key={i} viewBox="0 0 24 24" width={sz} height={sz}>
                    <defs>
                      <linearGradient id={`dist-avg-g${i}`} x1="0" x2="1" y1="0" y2="0">
                        <stop offset={`${Math.min(1, Math.max(0, f)) * 100}%`} stopColor={barColor} />
                        <stop offset={`${Math.min(1, Math.max(0, f)) * 100}%`} stopColor={emptyColor} />
                      </linearGradient>
                    </defs>
                    <path
                      d={starPath}
                      fill={`url(#dist-avg-g${i})`}
                      stroke={themeVars.stroke}
                      strokeWidth={1.5}
                      strokeLinejoin="round"
                    />
                  </svg>
                );
              })}
            </span>
            <span style={{ fontSize: 12, color: "#94a3b8" }}>
              {total.toLocaleString()} ratings
            </span>
          </div>
        </div>
      )}

      {/* bars */}
      {rows.map(({ star, count: cnt, pct }) => {
        const isActive = activeFilter === star;
        const isDimmed = activeFilter !== null && !isActive;
        const clickable = !!onFilter;

        return (
          <div
            key={star}
            onClick={() => onFilter?.(isActive ? null : star)}
            title={`${star} star${star !== 1 ? "s" : ""}: ${cnt} (${pct.toFixed(1)}%)`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: compact ? 6 : 8,
              cursor: clickable ? "pointer" : "default",
              opacity: isDimmed ? 0.4 : 1,
              transition: "opacity 0.2s",
            }}
          >
            {/* star label */}
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 3,
                flexShrink: 0,
                minWidth: compact ? 28 : 32,
                fontSize: compact ? 11 : 12,
                fontWeight: 600,
                color: isActive ? barColor : "#94a3b8",
              }}
            >
              {star}
              <svg viewBox="0 0 24 24" width={sz} height={sz}>
                <path
                  d={starPath}
                  fill={isActive ? barColor : "#94a3b8"}
                  stroke="none"
                />
              </svg>
            </span>

            {/* bar track */}
            <div
              style={{
                flex: 1,
                height: compact ? 6 : 8,
                borderRadius: 999,
                background: emptyColor,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: animate ? `${pct}%` : `${pct}%`,
                  background: isActive
                    ? barColor
                    : `linear-gradient(to right, ${barColor}, ${barColor}cc)`,
                  borderRadius: 999,
                  transition: animate ? "width 0.7s cubic-bezier(0.4,0,0.2,1)" : "none",
                  transformOrigin: "left",
                }}
              />
            </div>

            {/* count / percent */}
            <span
              style={{
                flexShrink: 0,
                minWidth: compact ? 28 : 36,
                fontSize: compact ? 11 : 12,
                color: "#64748b",
                textAlign: "right",
              }}
            >
              {showPercent ? `${pct.toFixed(0)}%` : showCount ? cnt.toLocaleString() : null}
            </span>
          </div>
        );
      })}
    </div>
  );
});

export default RatingDistribution;
