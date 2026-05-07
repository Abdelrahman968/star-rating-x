import React, { useState, useRef, useEffect, forwardRef } from "react";
import { getStarPath } from "./shapes.js";
import { getThemeVars } from "./themes.js";
import "./styles.css";

/**
 * StarRatingTooltip — like StarRating but with a rich popup tooltip on hover.
 *
 * Extra props:
 *  tooltipRenderer  {fn({value,label,index}): ReactNode}  Custom tooltip content
 *  tooltipPlacement {'top'|'bottom'}                       Default 'top'
 *  tooltips         {string[]}                             Label per star
 *
 * All other StarRating props are supported.
 */
const StarRatingTooltip = forwardRef(function StarRatingTooltip(
  {
    value: controlledValue,
    defaultValue = 0,
    count = 5,
    precision = 1,
    size = 32,
    gap = 6,
    shape = "star",
    theme = "gold",
    filledColor,
    emptyColor,
    strokeColor,
    strokeWidth = 1.5,
    readOnly = false,
    disabled = false,
    allowClear = true,
    showValue = false,
    tooltips,
    tooltipRenderer,
    tooltipPlacement = "top",
    animation = "bounce",
    direction = "ltr",
    highlightSelected = false,
    onChange,
    onHoverChange,
    label = "Rating",
    className = "",
    style = {},
  },
  ref
) {
  const uid = React.useId();
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = isControlled ? controlledValue : internalValue;

  const [hoverIndex, setHoverIndex]   = useState(null);
  const [hoverValue, setHoverValue]   = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);
  const [tooltipPos, setTooltipPos]   = useState({ x: 0 });

  const starRefs = useRef([]);

  const t = getThemeVars(theme);
  const filled  = filledColor  || t.filled;
  const empty   = emptyColor   || t.empty;
  const stroke  = strokeColor  || t.stroke;
  const sizeNum = typeof size === "number" ? size : parseInt(size, 10);

  const snapValue = React.useCallback(
    (raw) => (precision === 0.5 ? Math.round(raw * 2) / 2 : Math.round(raw)),
    [precision]
  );

  const getVal = React.useCallback(
    (e, index) => {
      if (precision === 1) return index + 1;
      const rect = e.currentTarget.getBoundingClientRect();
      return snapValue(index + ((e.clientX - rect.left) < rect.width / 2 ? 0.5 : 1));
    },
    [precision, snapValue]
  );

  const handleMouseMove = (e, index) => {
    if (readOnly || disabled) return;
    const val = getVal(e, index);
    setHoverValue(val);
    setHoverIndex(index);
    onHoverChange?.(val);

    if (starRefs.current[index]) {
      const rect = starRefs.current[index].getBoundingClientRect();
      setTooltipPos({ x: rect.left + rect.width / 2 });
    }
  };

  const handleMouseLeave = () => {
    if (readOnly || disabled) return;
    setHoverValue(null);
    setHoverIndex(null);
    onHoverChange?.(null);
  };

  const handleClick = (e, index) => {
    if (readOnly || disabled) return;
    const val = getVal(e, index);
    const next = allowClear && val === currentValue ? 0 : val;
    setActiveIndex(index);
    setTimeout(() => setActiveIndex(null), 500);
    if (!isControlled) setInternalValue(next);
    onChange?.(next);
  };

  const handleKeyDown = (e) => {
    if (readOnly || disabled) return;
    const step = precision;
    let next = currentValue;
    if      (e.key === "ArrowRight" || e.key === "ArrowUp")   next = Math.min(count, currentValue + step);
    else if (e.key === "ArrowLeft"  || e.key === "ArrowDown")  next = Math.max(0, currentValue - step);
    else if (e.key === "Home") next = 0;
    else if (e.key === "End")  next = count;
    else return;
    e.preventDefault();
    if (!isControlled) setInternalValue(next);
    onChange?.(next);
  };

  const displayValue = hoverValue ?? currentValue;

  const getFill = (i) => {
    const f = displayValue - i;
    if (f >= 1) return 1;
    if (f > 0 && precision === 0.5) return 0.5;
    return 0;
  };

  const starPath = getStarPath(shape);
  const tooltipLabel = hoverIndex !== null
    ? (tooltips?.[hoverIndex] ?? `${hoverValue} star${hoverValue !== 1 ? "s" : ""}`)
    : null;

  return (
    <span
      ref={ref}
      className={`srx-root ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        userSelect: "none",
        outline: "none",
        gap: `${gap}px`,
        flexDirection: direction === "rtl" ? "row-reverse" : "row",
        opacity: disabled ? 0.45 : 1,
        pointerEvents: disabled ? "none" : undefined,
        position: "relative",
        ...style,
      }}
      role="slider"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={count}
      aria-valuenow={currentValue}
      aria-valuetext={`${currentValue} out of ${count}`}
      aria-disabled={disabled}
      aria-readonly={readOnly}
      tabIndex={readOnly || disabled ? -1 : 0}
      onKeyDown={handleKeyDown}
      onMouseLeave={handleMouseLeave}
    >
      {/* gradient defs */}
      <svg width="0" height="0" aria-hidden style={{ position: "absolute" }}>
        <defs>
          {Array.from({ length: count }, (_, i) => (
            <linearGradient key={i} id={`${uid}-g${i}`} x1="0" x2="1" y1="0" y2="0">
              <stop offset={`${getFill(i) * 100}%`} stopColor={filled} />
              <stop offset={`${getFill(i) * 100}%`} stopColor={empty} />
            </linearGradient>
          ))}
        </defs>
      </svg>

      {/* tooltip popup */}
      {hoverIndex !== null && tooltipLabel && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            [tooltipPlacement === "bottom" ? "top" : "bottom"]: "calc(100% + 8px)",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#1e293b",
            color: "#f1f5f9",
            borderRadius: 8,
            padding: "6px 12px",
            fontSize: 12,
            fontWeight: 600,
            whiteSpace: "nowrap",
            pointerEvents: "none",
            zIndex: 100,
            boxShadow: "0 4px 16px #00000040",
            border: `1px solid ${filled}40`,
          }}
        >
          {tooltipRenderer
            ? tooltipRenderer({ value: hoverValue, label: tooltipLabel, index: hoverIndex })
            : tooltipLabel}
          {/* arrow */}
          <span
            style={{
              position: "absolute",
              [tooltipPlacement === "bottom" ? "top" : "bottom"]: -5,
              left: "50%",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "5px solid transparent",
              borderRight: "5px solid transparent",
              [tooltipPlacement === "bottom"
                ? "borderBottom"
                : "borderTop"]: "5px solid #1e293b",
            }}
          />
        </div>
      )}

      {/* stars */}
      {Array.from({ length: count }, (_, index) => {
        const fill = getFill(index);
        const fillColor = fill === 0 ? empty : fill === 1 ? filled : `url(#${uid}-g${index})`;
        const isSelected = highlightSelected && index + 1 === Math.ceil(currentValue);

        return (
          <span
            key={index}
            ref={(el) => (starRefs.current[index] = el)}
            onClick={(e) => handleClick(e, index)}
            onMouseMove={(e) => handleMouseMove(e, index)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: sizeNum,
              height: sizeNum,
              cursor: readOnly || disabled ? "default" : "pointer",
              position: "relative",
              transition: "transform 0.15s ease",
              animation:
                activeIndex === index && animation !== "none"
                  ? `srx-${animation} 0.4s cubic-bezier(0.36,0.07,0.19,0.97)`
                  : undefined,
            }}
          >
            {isSelected && (
              <span
                style={{
                  position: "absolute",
                  inset: -3,
                  borderRadius: "50%",
                  border: `2px solid ${filled}`,
                  opacity: 0.6,
                  pointerEvents: "none",
                }}
              />
            )}
            <svg viewBox="0 0 24 24" width={sizeNum} height={sizeNum} aria-hidden focusable="false">
              <path
                d={starPath}
                fill={fillColor}
                stroke={stroke}
                strokeWidth={strokeWidth}
                strokeLinejoin="round"
              />
            </svg>
          </span>
        );
      })}

      {showValue && (
        <span
          aria-hidden
          style={{
            marginLeft: 8,
            fontVariantNumeric: "tabular-nums",
            fontSize: sizeNum * 0.5,
            lineHeight: 1,
            color: filled,
            fontWeight: 600,
            minWidth: "2.5ch",
          }}
        >
          {displayValue.toFixed(precision === 0.5 ? 1 : 0)}
        </span>
      )}
    </span>
  );
});

export default StarRatingTooltip;
