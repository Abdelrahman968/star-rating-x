import React, {
  useState,
  useEffect,
  useCallback,
  useId,
  forwardRef,
} from "react";
import { getStarPath } from "./shapes.js";
import { getThemeVars } from "./themes.js";
import "./styles.css";

/**
 * StarRating — a fully-featured, accessible, customisable rating component.
 *
 * ── New in v2 ──────────────────────────────────────────────────────────────
 *  character      {string|fn}  Emoji, text, or render fn instead of SVG icon
 *                              e.g. character="😊"  or  character={({fill})=><MyIcon/>}
 *  customIcon     {string|fn}  Custom SVG path string OR render fn
 *                              e.g. customIcon="M12 2 L15 9 L22 9…"
 *                              or   customIcon={({fill, size})=><svg>…</svg>}
 *  mountAnimation {bool}       Count-up fill animation on first mount (default false)
 *  mountDuration  {number}     Duration of mount animation in ms (default 800)
 *
 * ── Original props ─────────────────────────────────────────────────────────
 *  value · defaultValue · count · precision · size · gap · shape · theme
 *  emptyColor · filledColor · strokeColor · strokeWidth · readOnly · disabled
 *  allowClear · showValue · tooltips · animation · direction · onChange
 *  onHoverChange · highlightSelected · label · className · style
 */
const StarRating = forwardRef(function StarRating(
  {
    // state
    value: controlledValue,
    defaultValue = 0,
    count = 5,
    precision = 1,

    // appearance
    size = 32,
    gap = 6,
    shape = "star",
    theme = "gold",
    emptyColor,
    filledColor,
    strokeColor,
    strokeWidth = 1.5,

    // NEW: custom icon / character
    character,       // emoji/text/render-fn — renders instead of SVG
    customIcon,      // SVG path string or render-fn — replaces built-in shape

    // NEW: mount animation
    mountAnimation = false,
    mountDuration = 800,

    // behaviour
    readOnly = false,
    disabled = false,
    allowClear = true,
    showValue = false,
    tooltips,
    animation = "bounce",
    direction = "ltr",
    highlightSelected = false,

    // callbacks
    onChange,
    onHoverChange,

    // a11y
    label = "Rating",
    className = "",
    style = {},
  },
  ref
) {
  const uid = useId();

  // ── state ──────────────────────────────────────────────────────────────────
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = isControlled ? controlledValue : internalValue;

  const [hoverValue, setHoverValue] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);

  // mount animation: animatedValue goes from 0 → currentValue on first render
  const [animatedValue, setAnimatedValue] = useState(
    mountAnimation ? 0 : null
  );
  useEffect(() => {
    if (!mountAnimation) return;
    const target = currentValue;
    const steps = 30;
    const interval = mountDuration / steps;
    let step = 0;
    const id = setInterval(() => {
      step++;
      setAnimatedValue(+(target * (step / steps)).toFixed(2));
      if (step >= steps) {
        setAnimatedValue(target);
        clearInterval(id);
      }
    }, interval);
    return () => clearInterval(id);
    // intentionally run only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── theme / colours ────────────────────────────────────────────────────────
  const themeVars = getThemeVars(theme);
  const resolvedFilled = filledColor || themeVars.filled;
  const resolvedEmpty  = emptyColor  || themeVars.empty;
  const resolvedStroke = strokeColor || themeVars.stroke;
  const sizeNum = typeof size === "number" ? size : parseInt(size, 10);

  // ── value helpers ──────────────────────────────────────────────────────────
  const snapValue = useCallback(
    (raw) => (precision === 0.5 ? Math.round(raw * 2) / 2 : Math.round(raw)),
    [precision]
  );

  const getValueFromPointer = useCallback(
    (e, index) => {
      if (precision === 1) return index + 1;
      const rect = e.currentTarget.getBoundingClientRect();
      const half = e.clientX - rect.left < rect.width / 2;
      return snapValue(index + (half ? 0.5 : 1));
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
      setTimeout(() => setActiveIndex(null), 500);
      if (!isControlled) setInternalValue(next);
      onChange?.(next);
    },
    [readOnly, disabled, getValueFromPointer, allowClear, currentValue, isControlled, onChange]
  );

  const handleKeyDown = useCallback(
    (e) => {
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
    },
    [readOnly, disabled, precision, currentValue, count, isControlled, onChange]
  );

  // ── display value (respects mount animation) ───────────────────────────────
  const displayValue = hoverValue ?? (animatedValue !== null ? animatedValue : currentValue);

  const getFill = (index) => {
    const f = displayValue - index;
    if (f >= 1) return 1;
    if (f > 0 && precision === 0.5) return 0.5;
    return 0;
  };

  // ── icon renderer ──────────────────────────────────────────────────────────
  const renderIcon = (index) => {
    const fill = getFill(index);
    const fillColor = fill === 0 ? resolvedEmpty : fill === 1 ? resolvedFilled : `url(#${uid}-g${index})`;

    // 1️⃣  character mode — emoji or text
    if (character !== undefined) {
      const charContent = typeof character === "function"
        ? character({ fill, index, filled: resolvedFilled, empty: resolvedEmpty })
        : character;
      return (
        <span
          className="srx-character"
          style={{
            fontSize: sizeNum,
            lineHeight: 1,
            width: sizeNum,
            height: sizeNum,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            filter: fill === 0 ? "grayscale(1) opacity(0.35)" : "none",
            transition: "filter 0.2s ease",
          }}
        >
          {charContent}
        </span>
      );
    }

    // 2️⃣  customIcon mode — SVG path string or render fn
    if (customIcon !== undefined) {
      if (typeof customIcon === "function") {
        return customIcon({ fill, fillColor, index, size: sizeNum, filled: resolvedFilled, empty: resolvedEmpty });
      }
      // string path
      return (
        <svg viewBox="0 0 24 24" width={sizeNum} height={sizeNum} aria-hidden focusable="false">
          <path
            d={customIcon}
            fill={fillColor}
            stroke={resolvedStroke}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
        </svg>
      );
    }

    // 3️⃣  default built-in shape
    return (
      <svg viewBox="0 0 24 24" width={sizeNum} height={sizeNum} aria-hidden focusable="false">
        <path
          d={getStarPath(shape)}
          fill={fillColor}
          stroke={resolvedStroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <span
      ref={ref}
      className={`srx-root ${disabled ? "srx-disabled" : ""} ${className}`}
      style={{
        "--srx-filled": resolvedFilled,
        "--srx-empty":  resolvedEmpty,
        "--srx-stroke": resolvedStroke,
        "--srx-size":   `${sizeNum}px`,
        "--srx-gap":    `${gap}px`,
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
      {/* gradient defs for half-star fills */}
      <svg width="0" height="0" aria-hidden style={{ position: "absolute" }}>
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
        const isSelected = highlightSelected && index + 1 === Math.ceil(currentValue);
        const tooltip = tooltips?.[index] ?? `${index + 1} star${index !== 0 ? "s" : ""}`;

        return (
          <span
            key={index}
            className={[
              "srx-star",
              activeIndex === index && animation !== "none" ? `srx-anim-${animation}` : "",
              isSelected ? "srx-selected" : "",
            ].join(" ").trim()}
            style={{ width: sizeNum, height: sizeNum }}
            title={tooltip}
            aria-label={tooltip}
            onClick={(e) => handleClick(e, index)}
            onMouseMove={(e) => handleMouseMove(e, index)}
          >
            {renderIcon(index)}
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
