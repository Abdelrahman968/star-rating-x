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
    character,
    customIcon,

    // NEW: mount animation
    mountAnimation = false,
    mountDuration = 800,

    // NEW v4: gradient fill
    filledGradient,          // e.g. ["#FBBF24","#F97316"] — overrides filledColor
    gradientDirection = "horizontal", // "horizontal" | "vertical" | "diagonal"

    // NEW v4: compare mode
    compareValue,            // second "ghost" rating to display behind the main one
    compareLabel = "avg",    // label shown next to the compare value

    // NEW v4: celebrate on max rating
    celebrateOnMax = false,
    confettiColors = ["#FBBF24", "#F97316", "#EC4899", "#8B5CF6", "#3B82F6"],

    // NEW v5: glow effect
    glowEffect = false,
    glowIntensity = 0.5,

    // NEW v5: skeleton / loading state
    loading = false,

    // NEW v5: debounced complete callback
    onRatingComplete,
    debounceMs = 0,

    // NEW v5: undo last rating
    allowUndo = false,
    undoTimeout = 4000,
    onUndo,

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

  // ── gradient fill ──────────────────────────────────────────────────────────
  // filledGradient overrides filledColor when provided
  const gradId = `${uid}-grad-fill`;
  const gradientAngle =
    gradientDirection === "vertical"  ? "0 0 0 1" :
    gradientDirection === "diagonal"  ? "0 0 1 1" :
                                        "0 0 1 0"; // horizontal (default)
  const [gx1, gy1, gx2, gy2] = gradientAngle.split(" ");
  const activeFill = filledGradient
    ? `url(#${gradId})`
    : resolvedFilled;

  // ── confetti on max ────────────────────────────────────────────────────────
  const [showConfetti, setShowConfetti] = useState(false);
  const prevValueRef = React.useRef(currentValue);

  useEffect(() => {
    if (
      celebrateOnMax &&
      currentValue === count &&
      prevValueRef.current !== count
    ) {
      setShowConfetti(true);
      const t = setTimeout(() => setShowConfetti(false), 1400);
      return () => clearTimeout(t);
    }
    prevValueRef.current = currentValue;
  }, [currentValue, count, celebrateOnMax]);

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
      const val  = getValueFromPointer(e, index);
      const next = allowClear && val === currentValue ? 0 : val;

      // undo support
      if (allowUndo) {
        setUndoPrev(currentValue);
        setUndoVisible(true);
        if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
        undoTimerRef.current = setTimeout(() => {
          setUndoVisible(false);
          setUndoPrev(null);
        }, undoTimeout);
      }

      setActiveIndex(index);
      setTimeout(() => setActiveIndex(null), 500);
      if (!isControlled) setInternalValue(next);
      onChange?.(next);

      // debounced onRatingComplete
      if (onRatingComplete) {
        if (completeTimerRef.current) clearTimeout(completeTimerRef.current);
        if (debounceMs > 0) {
          completeTimerRef.current = setTimeout(() => onRatingComplete(next), debounceMs);
        } else {
          onRatingComplete(next);
        }
      }
    },
    [
      readOnly, disabled, getValueFromPointer, allowClear, currentValue,
      allowUndo, undoTimeout, isControlled, onChange, onRatingComplete, debounceMs,
    ]
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

  // ── undo last rating ──────────────────────────────────────────────────────
  const [undoPrev, setUndoPrev]       = useState(null);
  const [undoVisible, setUndoVisible] = useState(false);
  const undoTimerRef   = React.useRef(null);
  const completeTimerRef = React.useRef(null);

  // ── loading skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <span
        ref={ref}
        className={`srx-root srx-skeleton ${className}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: `${typeof gap === "number" ? gap : 6}px`,
          ...style,
        }}
        aria-busy="true"
        aria-label="Loading rating..."
      >
        {Array.from({ length: count }, (_, i) => (
          <span
            key={i}
            style={{
              width:  typeof size === "number" ? size : 32,
              height: typeof size === "number" ? size : 32,
              borderRadius: "50%",
              background: "linear-gradient(90deg,#1e293b 25%,#334155 50%,#1e293b 75%)",
              backgroundSize: "200% 100%",
              animation: "srx-shimmer 1.4s infinite",
              display: "inline-block",
              flexShrink: 0,
            }}
          />
        ))}
      </span>
    );
  }

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
    const fillColor =
      fill === 0 ? resolvedEmpty :
      fill === 1 ? activeFill :
      `url(#${uid}-g${index})`;

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
      className={`srx-root ${disabled ? "srx-disabled" : ""} ${glowEffect ? "srx-glow" : ""} ${className}`}
      style={{
        "--srx-filled": resolvedFilled,
        "--srx-empty":  resolvedEmpty,
        "--srx-stroke": resolvedStroke,
        "--srx-size":   `${sizeNum}px`,
        "--srx-gap":    `${gap}px`,
        "--srx-glow-color": resolvedFilled,
        "--srx-glow-intensity": glowIntensity,
        gap: `${gap}px`,
        flexDirection: direction === "rtl" ? "row-reverse" : "row",
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
      {/* gradient defs for half-star fills + custom gradient fill */}
      <svg width="0" height="0" aria-hidden style={{ position: "absolute" }}>
        <defs>
          {/* half-star gradient per star */}
          {Array.from({ length: count }, (_, i) => (
            <linearGradient key={i} id={`${uid}-g${i}`} x1="0" x2="1" y1="0" y2="0">
              <stop offset={`${getFill(i) * 100}%`} stopColor={activeFill.startsWith("url") ? resolvedFilled : activeFill} />
              <stop offset={`${getFill(i) * 100}%`} stopColor={resolvedEmpty} />
            </linearGradient>
          ))}
          {/* custom gradient fill */}
          {filledGradient && filledGradient.length >= 2 && (
            <linearGradient id={gradId} x1={gx1} y1={gy1} x2={gx2} y2={gy2}>
              {filledGradient.map((color, i) => (
                <stop
                  key={i}
                  offset={`${(i / (filledGradient.length - 1)) * 100}%`}
                  stopColor={color}
                />
              ))}
            </linearGradient>
          )}
        </defs>
      </svg>

      {/* confetti burst */}
      {showConfetti && (
        <span
          aria-hidden
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            pointerEvents: "none",
            zIndex: 20,
          }}
        >
          {Array.from({ length: 18 }, (_, i) => {
            const angle = (i / 18) * 360;
            const color = confettiColors[i % confettiColors.length];
            const dist  = 28 + Math.random() * 22;
            const rad   = (angle * Math.PI) / 180;
            return (
              <span
                key={i}
                style={{
                  position: "absolute",
                  width: 5 + Math.random() * 4,
                  height: 5 + Math.random() * 4,
                  borderRadius: Math.random() > 0.5 ? "50%" : 2,
                  background: color,
                  left: `calc(50% + ${Math.cos(rad) * dist}px)`,
                  top:  `calc(50% + ${Math.sin(rad) * dist}px)`,
                  animation: `srx-confetti-${i % 3} 1.2s ease-out forwards`,
                  opacity: 1,
                }}
              />
            );
          })}
        </span>
      )}

      {/* compareValue ghost layer — rendered behind main stars */}
      {compareValue !== undefined && (
        <span
          aria-hidden
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            display: "inline-flex",
            gap: `${gap}px`,
            pointerEvents: "none",
            opacity: 0.28,
          }}
        >
          {Array.from({ length: count }, (_, index) => {
            const f = compareValue - index;
            const fc =
              f >= 1 ? resolvedFilled :
              f > 0  ? `url(#${uid}-cg${index})` :
              resolvedEmpty;
            return (
              <span
                key={index}
                style={{ width: sizeNum, height: sizeNum, display: "inline-flex" }}
              >
                <svg
                  viewBox="0 0 24 24"
                  width={sizeNum}
                  height={sizeNum}
                  aria-hidden
                >
                  <defs>
                    <linearGradient id={`${uid}-cg${index}`} x1="0" x2="1" y1="0" y2="0">
                      <stop offset={`${Math.max(0, Math.min(1, f)) * 100}%`} stopColor={resolvedFilled} />
                      <stop offset={`${Math.max(0, Math.min(1, f)) * 100}%`} stopColor={resolvedEmpty} />
                    </linearGradient>
                  </defs>
                  <path
                    d={getStarPath(shape)}
                    fill={fc}
                    stroke={resolvedStroke}
                    strokeWidth={strokeWidth}
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            );
          })}
        </span>
      )}

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

      {/* compareValue badge */}
      {compareValue !== undefined && (
        <span
          aria-hidden
          style={{
            marginLeft: 6,
            fontSize: sizeNum * 0.4,
            color: resolvedFilled,
            opacity: 0.55,
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          {compareLabel} {compareValue.toFixed(1)}
        </span>
      )}

      {/* undo toast */}
      {allowUndo && undoVisible && undoPrev !== null && (
        <span
          aria-live="polite"
          style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            left: "50%",
            transform: "translateX(-50%)",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "#1e293b",
            border: `1px solid ${resolvedFilled}40`,
            borderRadius: 10,
            padding: "6px 12px",
            fontSize: 12,
            fontWeight: 600,
            color: "#f1f5f9",
            whiteSpace: "nowrap",
            zIndex: 50,
            boxShadow: "0 4px 20px #00000040",
          }}
        >
          <span style={{ color: "#94a3b8" }}>Changed from {undoPrev}★</span>
          <button
            onClick={() => {
              if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
              if (!isControlled) setInternalValue(undoPrev);
              onChange?.(undoPrev);
              onUndo?.(undoPrev);
              setUndoVisible(false);
              setUndoPrev(null);
            }}
            style={{
              background: resolvedFilled + "20",
              border: `1px solid ${resolvedFilled}40`,
              borderRadius: 6,
              color: resolvedFilled,
              fontWeight: 700,
              fontSize: 11,
              padding: "2px 8px",
              cursor: "pointer",
            }}
          >
            Undo
          </button>
        </span>
      )}
    </span>
  );
});

export default StarRating;
