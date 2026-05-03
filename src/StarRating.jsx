import React, {
  useState,
  useRef,
  useCallback,
  useId,
  forwardRef,
} from "react";
import { getStarPath, SHAPE_PATHS } from "./shapes";
import { getThemeVars } from "./themes";
import "./styles.css";

/**
 * StarRating — a fully-featured, accessible, customisable rating component.
 *
 * Props:
 *  value          {number}   Controlled value (0–count)
 *  defaultValue   {number}   Uncontrolled initial value
 *  count          {number}   Total number of stars (default 5)
 *  precision      {number}   0.5 or 1 (default 1)
 *  size           {number|string}  px number or CSS string (default 32)
 *  gap            {number}   Gap between stars in px (default 6)
 *  shape          {string}   'star'|'heart'|'circle'|'diamond'|'thumb'
 *  theme          {string}   'gold'|'fire'|'ocean'|'neon'|'mono'|'rose'
 *  emptyColor     {string}   Override empty star colour
 *  filledColor    {string}   Override filled star colour
 *  strokeColor    {string}   Override stroke colour
 *  strokeWidth    {number}   SVG stroke width (default 1.5)
 *  readOnly       {bool}     Disable interaction
 *  disabled       {bool}     Disable + grey-out
 *  allowClear     {bool}     Clicking current value resets to 0 (default true)
 *  showValue      {bool}     Show numeric label
 *  tooltips       {string[]} Custom tooltip labels per star
 *  animation      {string}  'bounce'|'pulse'|'wiggle'|'pop'|'none'
 *  direction      {string}  'ltr'|'rtl'
 *  onChange       {fn}      Called with new value
 *  onHoverChange  {fn}      Called with hovered value (or null)
 *  highlightSelected {bool} Adds ring on selected star
 *  label          {string}  Accessible label (default "Rating")
 *  className      {string}
 *  style          {object}
 */
const StarRating = forwardRef(function StarRating(
  {
    value: controlledValue,
    defaultValue = 0,
    count = 5,
    precision = 1,
    size = 32,
    gap = 6,
    shape = "star",
    theme = "gold",
    emptyColor,
    filledColor,
    strokeColor,
    strokeWidth = 1.5,
    readOnly = false,
    disabled = false,
    allowClear = true,
    showValue = false,
    tooltips,
    animation = "bounce",
    direction = "ltr",
    onChange,
    onHoverChange,
    highlightSelected = false,
    label = "Rating",
    className = "",
    style = {},
  },
  ref
) {
  const uid = useId();
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = isControlled ? controlledValue : internalValue;

  const [hoverValue, setHoverValue] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null); // for animation
  const containerRef = useRef(null);

  const themeVars = getThemeVars(theme);
  const resolvedFilled = filledColor || themeVars.filled;
  const resolvedEmpty = emptyColor || themeVars.empty;
  const resolvedStroke = strokeColor || themeVars.stroke;

  const sizeNum = typeof size === "number" ? size : parseInt(size, 10);

  // ── value helpers ──────────────────────────────────────────────────────────
  const snapValue = useCallback(
    (raw) => {
      if (precision === 0.5) return Math.round(raw * 2) / 2;
      return Math.round(raw);
    },
    [precision]
  );

  const getValueFromPointer = useCallback(
    (e, index) => {
      if (precision === 1) return index + 1;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const half = x < rect.width / 2;
      const raw = index + (half ? 0.5 : 1);
      return snapValue(raw);
    },
    [precision, snapValue]
  );

  // ── interaction handlers ───────────────────────────────────────────────────
  const handleMouseMove = useCallback(
    (e, index) => {
      if (readOnly || disabled) return;
      const val = getValueFromPointer(e, index);
      setHoverValue(val);
      onHoverChange?.(val);
    },
    [readOnly, disabled, getValueFromPointer, onHoverChange]
  );

  const handleMouseLeave = useCallback(() => {
    if (readOnly || disabled) return;
    setHoverValue(null);
    onHoverChange?.(null);
  }, [readOnly, disabled, onHoverChange]);

  const handleClick = useCallback(
    (e, index) => {
      if (readOnly || disabled) return;
      const val = getValueFromPointer(e, index);
      const next = allowClear && val === currentValue ? 0 : val;
      setActiveIndex(index);
      setTimeout(() => setActiveIndex(null), 400);
      if (!isControlled) setInternalValue(next);
      onChange?.(next);
    },
    [
      readOnly,
      disabled,
      getValueFromPointer,
      allowClear,
      currentValue,
      isControlled,
      onChange,
    ]
  );

  // keyboard support
  const handleKeyDown = useCallback(
    (e) => {
      if (readOnly || disabled) return;
      const step = precision;
      let next = currentValue;
      if (e.key === "ArrowRight" || e.key === "ArrowUp")
        next = Math.min(count, currentValue + step);
      else if (e.key === "ArrowLeft" || e.key === "ArrowDown")
        next = Math.max(0, currentValue - step);
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = count;
      else return;
      e.preventDefault();
      if (!isControlled) setInternalValue(next);
      onChange?.(next);
    },
    [readOnly, disabled, precision, currentValue, count, isControlled, onChange]
  );

  // ── rendering helpers ──────────────────────────────────────────────────────
  const displayValue = hoverValue ?? currentValue;

  const getFill = (index) => {
    const filled = displayValue - index;
    if (filled >= 1) return 1;
    if (filled > 0 && precision === 0.5) return 0.5;
    return 0;
  };

  const starPath = getStarPath(shape);

  const animClass =
    animation !== "none" && activeIndex !== null ? `srx-anim-${animation}` : "";

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <span
      ref={ref}
      className={`srx-root ${disabled ? "srx-disabled" : ""} ${className}`}
      style={{
        ...themeVars.cssVars,
        "--srx-filled": resolvedFilled,
        "--srx-empty": resolvedEmpty,
        "--srx-stroke": resolvedStroke,
        "--srx-size": `${sizeNum}px`,
        "--srx-gap": `${gap}px`,
        gap: `${gap}px`,
        flexDirection: direction === "rtl" ? "row-reverse" : "row",
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
      {/* hidden gradient defs shared across all stars */}
      <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: "absolute" }}>
        <defs>
          {Array.from({ length: count }, (_, i) => (
            <linearGradient key={i} id={`${uid}-g${i}`} x1="0" x2="1" y1="0" y2="0">
              <stop offset={`${getFill(i) * 100}%`} stopColor={resolvedFilled} />
              <stop offset={`${getFill(i) * 100}%`} stopColor={resolvedEmpty} />
            </linearGradient>
          ))}
        </defs>
      </svg>

      {Array.from({ length: count }, (_, index) => {
        const fill = getFill(index);
        const isSelected = highlightSelected && index + 1 === Math.ceil(currentValue);
        const tooltip = tooltips?.[index] ?? `${index + 1} star${index !== 0 ? "s" : ""}`;

        return (
          <span
            key={index}
            className={`srx-star ${activeIndex === index ? `srx-anim-${animation}` : ""} ${isSelected ? "srx-selected" : ""}`}
            style={{ width: sizeNum, height: sizeNum }}
            title={tooltip}
            aria-label={tooltip}
            onClick={(e) => handleClick(e, index)}
            onMouseMove={(e) => handleMouseMove(e, index)}
          >
            <svg
              viewBox="0 0 24 24"
              width={sizeNum}
              height={sizeNum}
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d={starPath}
                fill={fill === 0 ? resolvedEmpty : fill === 1 ? resolvedFilled : `url(#${uid}-g${index})`}
                stroke={resolvedStroke}
                strokeWidth={strokeWidth}
                strokeLinejoin="round"
              />
            </svg>
          </span>
        );
      })}

      {showValue && (
        <span className="srx-value" aria-hidden="true">
          {displayValue.toFixed(precision === 0.5 ? 1 : 0)}
        </span>
      )}
    </span>
  );
});

export default StarRating;
