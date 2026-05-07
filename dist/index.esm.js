import React, { forwardRef, useId, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';

/**
 * SVG paths (viewBox 0 0 24 24) for each rating shape.
 */
const SHAPE_PATHS = {
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  heart: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
  circle: "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z",
  diamond: "M12 2 L22 12 L12 22 L2 12 Z",
  thumb: "M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14zm-7 11H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h2v11z",
  flag: "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7",
  lightning: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  flower: "M12 2C9 2 9 6 12 6C9 6 7 9 9.5 11C7 9 3 10 3 13C3 16 7 16 9.5 14C7 16 8 20 11 21C11 18 12 16 12 16C12 16 13 18 13 21C16 20 17 16 14.5 14C17 16 21 16 21 13C21 10 17 9 14.5 11C17 9 15 6 12 6C15 6 15 2 12 2Z"
};
function getStarPath(shape = "star") {
  return SHAPE_PATHS[shape] ?? SHAPE_PATHS.star;
}

/**
 * Built-in themes for StarRatingX.
 * Each theme exports filled, empty, stroke colours and optional CSS vars.
 */
const themes = {
  gold: {
    filled: "#FBBF24",
    empty: "#E5E7EB",
    stroke: "#F59E0B"
  },
  fire: {
    filled: "#EF4444",
    empty: "#FEE2E2",
    stroke: "#B91C1C"
  },
  ocean: {
    filled: "#3B82F6",
    empty: "#DBEAFE",
    stroke: "#1D4ED8"
  },
  neon: {
    filled: "#A3E635",
    empty: "#1a1a1a",
    stroke: "#65A30D"
  },
  rose: {
    filled: "#EC4899",
    empty: "#FCE7F3",
    stroke: "#BE185D"
  },
  mono: {
    filled: "#1F2937",
    empty: "#D1D5DB",
    stroke: "#374151"
  },
  violet: {
    filled: "#8B5CF6",
    empty: "#EDE9FE",
    stroke: "#6D28D9"
  },
  sunset: {
    filled: "#F97316",
    empty: "#FFEDD5",
    stroke: "#C2410C"
  },
  mint: {
    filled: "#10B981",
    empty: "#D1FAE5",
    stroke: "#059669"
  }
};
function getThemeVars(themeName = "gold") {
  const t = themes[themeName] ?? themes.gold;
  return {
    filled: t.filled,
    empty: t.empty,
    stroke: t.stroke,
    cssVars: {}
  };
}
const THEME_NAMES = Object.keys(themes);

const StarRating = /*#__PURE__*/forwardRef(function StarRating({
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
  filledGradient,
  // e.g. ["#FBBF24","#F97316"] — overrides filledColor
  gradientDirection = "horizontal",
  // "horizontal" | "vertical" | "diagonal"

  // NEW v4: compare mode
  compareValue,
  // second "ghost" rating to display behind the main one
  compareLabel = "avg",
  // label shown next to the compare value

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
  style = {}
}, ref) {
  const uid = useId();

  // ── state ──────────────────────────────────────────────────────────────────
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = isControlled ? controlledValue : internalValue;
  const [hoverValue, setHoverValue] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);

  // mount animation: animatedValue goes from 0 → currentValue on first render
  const [animatedValue, setAnimatedValue] = useState(mountAnimation ? 0 : null);
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
  const resolvedEmpty = emptyColor || themeVars.empty;
  const resolvedStroke = strokeColor || themeVars.stroke;
  const sizeNum = typeof size === "number" ? size : parseInt(size, 10);

  // ── gradient fill ──────────────────────────────────────────────────────────
  // filledGradient overrides filledColor when provided
  const gradId = `${uid}-grad-fill`;
  const gradientAngle = gradientDirection === "vertical" ? "0 0 0 1" : gradientDirection === "diagonal" ? "0 0 1 1" : "0 0 1 0"; // horizontal (default)
  const [gx1, gy1, gx2, gy2] = gradientAngle.split(" ");
  const activeFill = filledGradient ? `url(#${gradId})` : resolvedFilled;

  // ── confetti on max ────────────────────────────────────────────────────────
  const [showConfetti, setShowConfetti] = useState(false);
  const prevValueRef = React.useRef(currentValue);
  useEffect(() => {
    if (celebrateOnMax && currentValue === count && prevValueRef.current !== count) {
      setShowConfetti(true);
      const t = setTimeout(() => setShowConfetti(false), 1400);
      return () => clearTimeout(t);
    }
    prevValueRef.current = currentValue;
  }, [currentValue, count, celebrateOnMax]);

  // ── value helpers ──────────────────────────────────────────────────────────
  const snapValue = useCallback(raw => precision === 0.5 ? Math.round(raw * 2) / 2 : Math.round(raw), [precision]);
  const getValueFromPointer = useCallback((e, index) => {
    if (precision === 1) return index + 1;
    const rect = e.currentTarget.getBoundingClientRect();
    const half = e.clientX - rect.left < rect.width / 2;
    return snapValue(index + (half ? 0.5 : 1));
  }, [precision, snapValue]);

  // ── interaction handlers ───────────────────────────────────────────────────
  const handleMouseMove = useCallback((e, index) => {
    if (readOnly || disabled) return;
    const val = getValueFromPointer(e, index);
    setHoverValue(val);
    onHoverChange?.(val);
  }, [readOnly, disabled, getValueFromPointer, onHoverChange]);
  const handleMouseLeave = useCallback(() => {
    if (readOnly || disabled) return;
    setHoverValue(null);
    onHoverChange?.(null);
  }, [readOnly, disabled, onHoverChange]);
  const handleClick = useCallback((e, index) => {
    if (readOnly || disabled) return;
    const val = getValueFromPointer(e, index);
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
  }, [readOnly, disabled, getValueFromPointer, allowClear, currentValue, allowUndo, undoTimeout, isControlled, onChange, onRatingComplete, debounceMs]);
  const handleKeyDown = useCallback(e => {
    if (readOnly || disabled) return;
    const step = precision;
    let next = currentValue;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") next = Math.min(count, currentValue + step);else if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = Math.max(0, currentValue - step);else if (e.key === "Home") next = 0;else if (e.key === "End") next = count;else return;
    e.preventDefault();
    if (!isControlled) setInternalValue(next);
    onChange?.(next);
  }, [readOnly, disabled, precision, currentValue, count, isControlled, onChange]);

  // ── undo last rating ──────────────────────────────────────────────────────
  const [undoPrev, setUndoPrev] = useState(null);
  const [undoVisible, setUndoVisible] = useState(false);
  const undoTimerRef = React.useRef(null);
  const completeTimerRef = React.useRef(null);

  // ── loading skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return /*#__PURE__*/jsx("span", {
      ref: ref,
      className: `srx-root srx-skeleton ${className}`,
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: `${typeof gap === "number" ? gap : 6}px`,
        ...style
      },
      "aria-busy": "true",
      "aria-label": "Loading rating...",
      children: Array.from({
        length: count
      }, (_, i) => /*#__PURE__*/jsx("span", {
        style: {
          width: typeof size === "number" ? size : 32,
          height: typeof size === "number" ? size : 32,
          borderRadius: "50%",
          background: "linear-gradient(90deg,#1e293b 25%,#334155 50%,#1e293b 75%)",
          backgroundSize: "200% 100%",
          animation: "srx-shimmer 1.4s infinite",
          display: "inline-block",
          flexShrink: 0
        }
      }, i))
    });
  }

  // ── display value (respects mount animation) ───────────────────────────────
  const displayValue = hoverValue ?? (animatedValue !== null ? animatedValue : currentValue);
  const getFill = index => {
    const f = displayValue - index;
    if (f >= 1) return 1;
    if (f > 0 && precision === 0.5) return 0.5;
    return 0;
  };

  // ── icon renderer ──────────────────────────────────────────────────────────
  const renderIcon = index => {
    const fill = getFill(index);
    const fillColor = fill === 0 ? resolvedEmpty : fill === 1 ? activeFill : `url(#${uid}-g${index})`;

    // 1️⃣  character mode — emoji or text
    if (character !== undefined) {
      const charContent = typeof character === "function" ? character({
        fill,
        index,
        filled: resolvedFilled,
        empty: resolvedEmpty
      }) : character;
      return /*#__PURE__*/jsx("span", {
        className: "srx-character",
        style: {
          fontSize: sizeNum,
          lineHeight: 1,
          width: sizeNum,
          height: sizeNum,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          filter: fill === 0 ? "grayscale(1) opacity(0.35)" : "none",
          transition: "filter 0.2s ease"
        },
        children: charContent
      });
    }

    // 2️⃣  customIcon mode — SVG path string or render fn
    if (customIcon !== undefined) {
      if (typeof customIcon === "function") {
        return customIcon({
          fill,
          fillColor,
          index,
          size: sizeNum,
          filled: resolvedFilled,
          empty: resolvedEmpty
        });
      }
      // string path
      return /*#__PURE__*/jsx("svg", {
        viewBox: "0 0 24 24",
        width: sizeNum,
        height: sizeNum,
        "aria-hidden": true,
        focusable: "false",
        children: /*#__PURE__*/jsx("path", {
          d: customIcon,
          fill: fillColor,
          stroke: resolvedStroke,
          strokeWidth: strokeWidth,
          strokeLinejoin: "round"
        })
      });
    }

    // 3️⃣  default built-in shape
    return /*#__PURE__*/jsx("svg", {
      viewBox: "0 0 24 24",
      width: sizeNum,
      height: sizeNum,
      "aria-hidden": true,
      focusable: "false",
      children: /*#__PURE__*/jsx("path", {
        d: getStarPath(shape),
        fill: fillColor,
        stroke: resolvedStroke,
        strokeWidth: strokeWidth,
        strokeLinejoin: "round"
      })
    });
  };

  // ── render ─────────────────────────────────────────────────────────────────
  return /*#__PURE__*/jsxs("span", {
    ref: ref,
    className: `srx-root ${disabled ? "srx-disabled" : ""} ${glowEffect ? "srx-glow" : ""} ${className}`,
    style: {
      "--srx-filled": resolvedFilled,
      "--srx-empty": resolvedEmpty,
      "--srx-stroke": resolvedStroke,
      "--srx-size": `${sizeNum}px`,
      "--srx-gap": `${gap}px`,
      "--srx-glow-color": resolvedFilled,
      "--srx-glow-intensity": glowIntensity,
      gap: `${gap}px`,
      flexDirection: direction === "rtl" ? "row-reverse" : "row",
      position: "relative",
      ...style
    },
    role: "slider",
    "aria-label": label,
    "aria-valuemin": 0,
    "aria-valuemax": count,
    "aria-valuenow": currentValue,
    "aria-valuetext": `${currentValue} out of ${count}`,
    "aria-disabled": disabled,
    "aria-readonly": readOnly,
    tabIndex: readOnly || disabled ? -1 : 0,
    onKeyDown: handleKeyDown,
    onMouseLeave: handleMouseLeave,
    children: [/*#__PURE__*/jsx("svg", {
      width: "0",
      height: "0",
      "aria-hidden": true,
      style: {
        position: "absolute"
      },
      children: /*#__PURE__*/jsxs("defs", {
        children: [Array.from({
          length: count
        }, (_, i) => /*#__PURE__*/jsxs("linearGradient", {
          id: `${uid}-g${i}`,
          x1: "0",
          x2: "1",
          y1: "0",
          y2: "0",
          children: [/*#__PURE__*/jsx("stop", {
            offset: `${getFill(i) * 100}%`,
            stopColor: activeFill.startsWith("url") ? resolvedFilled : activeFill
          }), /*#__PURE__*/jsx("stop", {
            offset: `${getFill(i) * 100}%`,
            stopColor: resolvedEmpty
          })]
        }, i)), filledGradient && filledGradient.length >= 2 && /*#__PURE__*/jsx("linearGradient", {
          id: gradId,
          x1: gx1,
          y1: gy1,
          x2: gx2,
          y2: gy2,
          children: filledGradient.map((color, i) => /*#__PURE__*/jsx("stop", {
            offset: `${i / (filledGradient.length - 1) * 100}%`,
            stopColor: color
          }, i))
        })]
      })
    }), showConfetti && /*#__PURE__*/jsx("span", {
      "aria-hidden": true,
      style: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%,-50%)",
        pointerEvents: "none",
        zIndex: 20
      },
      children: Array.from({
        length: 18
      }, (_, i) => {
        const angle = i / 18 * 360;
        const color = confettiColors[i % confettiColors.length];
        const dist = 28 + Math.random() * 22;
        const rad = angle * Math.PI / 180;
        return /*#__PURE__*/jsx("span", {
          style: {
            position: "absolute",
            width: 5 + Math.random() * 4,
            height: 5 + Math.random() * 4,
            borderRadius: Math.random() > 0.5 ? "50%" : 2,
            background: color,
            left: `calc(50% + ${Math.cos(rad) * dist}px)`,
            top: `calc(50% + ${Math.sin(rad) * dist}px)`,
            animation: `srx-confetti-${i % 3} 1.2s ease-out forwards`,
            opacity: 1
          }
        }, i);
      })
    }), compareValue !== undefined && /*#__PURE__*/jsx("span", {
      "aria-hidden": true,
      style: {
        position: "absolute",
        left: 0,
        top: 0,
        display: "inline-flex",
        gap: `${gap}px`,
        pointerEvents: "none",
        opacity: 0.28
      },
      children: Array.from({
        length: count
      }, (_, index) => {
        const f = compareValue - index;
        const fc = f >= 1 ? resolvedFilled : f > 0 ? `url(#${uid}-cg${index})` : resolvedEmpty;
        return /*#__PURE__*/jsx("span", {
          style: {
            width: sizeNum,
            height: sizeNum,
            display: "inline-flex"
          },
          children: /*#__PURE__*/jsxs("svg", {
            viewBox: "0 0 24 24",
            width: sizeNum,
            height: sizeNum,
            "aria-hidden": true,
            children: [/*#__PURE__*/jsx("defs", {
              children: /*#__PURE__*/jsxs("linearGradient", {
                id: `${uid}-cg${index}`,
                x1: "0",
                x2: "1",
                y1: "0",
                y2: "0",
                children: [/*#__PURE__*/jsx("stop", {
                  offset: `${Math.max(0, Math.min(1, f)) * 100}%`,
                  stopColor: resolvedFilled
                }), /*#__PURE__*/jsx("stop", {
                  offset: `${Math.max(0, Math.min(1, f)) * 100}%`,
                  stopColor: resolvedEmpty
                })]
              })
            }), /*#__PURE__*/jsx("path", {
              d: getStarPath(shape),
              fill: fc,
              stroke: resolvedStroke,
              strokeWidth: strokeWidth,
              strokeLinejoin: "round"
            })]
          })
        }, index);
      })
    }), Array.from({
      length: count
    }, (_, index) => {
      const isSelected = highlightSelected && index + 1 === Math.ceil(currentValue);
      const tooltip = tooltips?.[index] ?? `${index + 1} star${index !== 0 ? "s" : ""}`;
      return /*#__PURE__*/jsx("span", {
        className: ["srx-star", activeIndex === index && animation !== "none" ? `srx-anim-${animation}` : "", isSelected ? "srx-selected" : ""].join(" ").trim(),
        style: {
          width: sizeNum,
          height: sizeNum
        },
        title: tooltip,
        "aria-label": tooltip,
        onClick: e => handleClick(e, index),
        onMouseMove: e => handleMouseMove(e, index),
        children: renderIcon(index)
      }, index);
    }), showValue && /*#__PURE__*/jsx("span", {
      className: "srx-value",
      "aria-hidden": "true",
      children: displayValue.toFixed(precision === 0.5 ? 1 : 0)
    }), compareValue !== undefined && /*#__PURE__*/jsxs("span", {
      "aria-hidden": true,
      style: {
        marginLeft: 6,
        fontSize: sizeNum * 0.4,
        color: resolvedFilled,
        opacity: 0.55,
        fontWeight: 600,
        whiteSpace: "nowrap"
      },
      children: [compareLabel, " ", compareValue.toFixed(1)]
    }), allowUndo && undoVisible && undoPrev !== null && /*#__PURE__*/jsxs("span", {
      "aria-live": "polite",
      style: {
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
        boxShadow: "0 4px 20px #00000040"
      },
      children: [/*#__PURE__*/jsxs("span", {
        style: {
          color: "#94a3b8"
        },
        children: ["Changed from ", undoPrev, "\u2605"]
      }), /*#__PURE__*/jsx("button", {
        onClick: () => {
          if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
          if (!isControlled) setInternalValue(undoPrev);
          onChange?.(undoPrev);
          onUndo?.(undoPrev);
          setUndoVisible(false);
          setUndoPrev(null);
        },
        style: {
          background: resolvedFilled + "20",
          border: `1px solid ${resolvedFilled}40`,
          borderRadius: 6,
          color: resolvedFilled,
          fontWeight: 700,
          fontSize: 11,
          padding: "2px 8px",
          cursor: "pointer"
        },
        children: "Undo"
      })]
    })]
  });
});

const RatingGroup = /*#__PURE__*/forwardRef(function RatingGroup({
  categories = [],
  values: controlledValues,
  defaultValues = {},
  onChange,
  showAverage = false,
  overallLabel = "Overall",
  // ← NEW: fully customisable label
  averagePrecision = 0.5,
  // ← NEW: precision for the average row
  showValues = false,
  labelWidth = 120,
  rowGap = 12,
  // ← NEW: gap between rows
  dividerColor = "#e5e7eb",
  // ← NEW: divider colour
  averageLabelStyle = {},
  // ← NEW: custom style for overall label
  gap = 6,
  size = 28,
  theme = "gold",
  ...starProps
}, ref) {
  const isControlled = controlledValues !== undefined;
  const [internalValues, setInternalValues] = useState(() => {
    const init = {};
    categories.forEach(({
      key
    }) => {
      init[key] = defaultValues[key] ?? 0;
    });
    return init;
  });
  const currentValues = isControlled ? controlledValues : internalValues;
  const handleChange = (key, val) => {
    const next = {
      ...currentValues,
      [key]: val
    };
    if (!isControlled) setInternalValues(next);
    onChange?.(key, val, next);
  };
  const average = categories.length > 0 ? categories.reduce((sum, {
    key
  }) => sum + (currentValues[key] ?? 0), 0) / categories.length : 0;
  return /*#__PURE__*/jsxs("div", {
    ref: ref,
    className: "srx-group",
    style: {
      display: "flex",
      flexDirection: "column",
      gap: rowGap
    },
    children: [categories.map(({
      key,
      label
    }) => /*#__PURE__*/jsxs("div", {
      className: "srx-group-row",
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12
      },
      children: [/*#__PURE__*/jsx("span", {
        className: "srx-group-label",
        style: {
          width: labelWidth,
          flexShrink: 0,
          fontSize: size * 0.44,
          color: "inherit",
          fontWeight: 500,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap"
        },
        children: label
      }), /*#__PURE__*/jsx(StarRating, {
        value: currentValues[key] ?? 0,
        onChange: val => handleChange(key, val),
        size: size,
        gap: gap,
        theme: theme,
        showValue: showValues,
        ...starProps
      })]
    }, key)), showAverage && categories.length > 0 && /*#__PURE__*/jsxs("div", {
      className: "srx-group-average",
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        paddingTop: 8,
        borderTop: `1px solid ${dividerColor}`,
        marginTop: 4
      },
      children: [/*#__PURE__*/jsx("span", {
        style: {
          width: labelWidth,
          flexShrink: 0,
          fontSize: size * 0.44,
          fontWeight: 700,
          color: "inherit",
          ...averageLabelStyle
        },
        children: overallLabel
      }), /*#__PURE__*/jsx(StarRating, {
        value: +average.toFixed(averagePrecision === 0.5 ? 1 : 0),
        precision: averagePrecision,
        size: size,
        gap: gap,
        theme: theme,
        readOnly: true,
        showValue: true
      })]
    })]
  });
});

const RatingDistribution = /*#__PURE__*/forwardRef(function RatingDistribution({
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
  style = {}
}, ref) {
  const themeVars = getThemeVars(theme);
  const barColor = filledColor || themeVars.filled;
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
  const rows = useMemo(() => Array.from({
    length: count
  }, (_, i) => count - i).map(star => ({
    star,
    count: data[star] || 0,
    pct: total > 0 ? (data[star] || 0) / total * 100 : 0
  })), [data, count, total]);
  const starPath = "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";
  const sz = compact ? 12 : 14;
  return /*#__PURE__*/jsxs("div", {
    ref: ref,
    className: `srx-dist ${className}`,
    style: {
      display: "flex",
      flexDirection: "column",
      gap: compact ? 6 : 8,
      ...style
    },
    children: [!compact && total > 0 && /*#__PURE__*/jsxs("div", {
      style: {
        display: "flex",
        alignItems: "baseline",
        gap: 8,
        marginBottom: 4
      },
      children: [/*#__PURE__*/jsx("span", {
        style: {
          fontSize: 36,
          fontWeight: 900,
          lineHeight: 1,
          color: barColor
        },
        children: computedAvg.toFixed(1)
      }), /*#__PURE__*/jsxs("div", {
        style: {
          display: "flex",
          flexDirection: "column",
          gap: 2
        },
        children: [/*#__PURE__*/jsx("span", {
          style: {
            display: "flex",
            gap: 2
          },
          children: Array.from({
            length: count
          }, (_, i) => {
            const f = computedAvg - i;
            return /*#__PURE__*/jsxs("svg", {
              viewBox: "0 0 24 24",
              width: sz,
              height: sz,
              children: [/*#__PURE__*/jsx("defs", {
                children: /*#__PURE__*/jsxs("linearGradient", {
                  id: `dist-avg-g${i}`,
                  x1: "0",
                  x2: "1",
                  y1: "0",
                  y2: "0",
                  children: [/*#__PURE__*/jsx("stop", {
                    offset: `${Math.min(1, Math.max(0, f)) * 100}%`,
                    stopColor: barColor
                  }), /*#__PURE__*/jsx("stop", {
                    offset: `${Math.min(1, Math.max(0, f)) * 100}%`,
                    stopColor: emptyColor
                  })]
                })
              }), /*#__PURE__*/jsx("path", {
                d: starPath,
                fill: `url(#dist-avg-g${i})`,
                stroke: themeVars.stroke,
                strokeWidth: 1.5,
                strokeLinejoin: "round"
              })]
            }, i);
          })
        }), /*#__PURE__*/jsxs("span", {
          style: {
            fontSize: 12,
            color: "#94a3b8"
          },
          children: [total.toLocaleString(), " ratings"]
        })]
      })]
    }), rows.map(({
      star,
      count: cnt,
      pct
    }) => {
      const isActive = activeFilter === star;
      const isDimmed = activeFilter !== null && !isActive;
      const clickable = !!onFilter;
      return /*#__PURE__*/jsxs("div", {
        onClick: () => onFilter?.(isActive ? null : star),
        title: `${star} star${star !== 1 ? "s" : ""}: ${cnt} (${pct.toFixed(1)}%)`,
        style: {
          display: "flex",
          alignItems: "center",
          gap: compact ? 6 : 8,
          cursor: clickable ? "pointer" : "default",
          opacity: isDimmed ? 0.4 : 1,
          transition: "opacity 0.2s"
        },
        children: [/*#__PURE__*/jsxs("span", {
          style: {
            display: "flex",
            alignItems: "center",
            gap: 3,
            flexShrink: 0,
            minWidth: compact ? 28 : 32,
            fontSize: compact ? 11 : 12,
            fontWeight: 600,
            color: isActive ? barColor : "#94a3b8"
          },
          children: [star, /*#__PURE__*/jsx("svg", {
            viewBox: "0 0 24 24",
            width: sz,
            height: sz,
            children: /*#__PURE__*/jsx("path", {
              d: starPath,
              fill: isActive ? barColor : "#94a3b8",
              stroke: "none"
            })
          })]
        }), /*#__PURE__*/jsx("div", {
          style: {
            flex: 1,
            height: compact ? 6 : 8,
            borderRadius: 999,
            background: emptyColor,
            overflow: "hidden"
          },
          children: /*#__PURE__*/jsx("div", {
            style: {
              height: "100%",
              width: animate ? `${pct}%` : `${pct}%`,
              background: isActive ? barColor : `linear-gradient(to right, ${barColor}, ${barColor}cc)`,
              borderRadius: 999,
              transition: animate ? "width 0.7s cubic-bezier(0.4,0,0.2,1)" : "none",
              transformOrigin: "left"
            }
          })
        }), /*#__PURE__*/jsx("span", {
          style: {
            flexShrink: 0,
            minWidth: compact ? 28 : 36,
            fontSize: compact ? 11 : 12,
            color: "#64748b",
            textAlign: "right"
          },
          children: showPercent ? `${pct.toFixed(0)}%` : showCount ? cnt.toLocaleString() : null
        })]
      }, star);
    })]
  });
});

const StarRatingInput = /*#__PURE__*/forwardRef(function StarRatingInput({
  // form
  name,
  label,
  required = false,
  minValue,
  errorMessage,
  helperText,
  // style overrides
  labelStyle = {},
  errorStyle = {},
  helperStyle = {},
  wrapperStyle = {},
  // StarRating passthrough
  value,
  onChange,
  onBlur,
  ...starProps
}, _ref) {
  const innerId = useId();
  const id = name ?? innerId;
  const hasError = !!errorMessage;
  const handleChange = val => {
    onChange?.(val);
  };
  return /*#__PURE__*/jsxs("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
      ...wrapperStyle
    },
    children: [label && /*#__PURE__*/jsxs("label", {
      htmlFor: id,
      style: {
        fontSize: 14,
        fontWeight: 600,
        color: hasError ? "#ef4444" : "inherit",
        display: "flex",
        alignItems: "center",
        gap: 4,
        ...labelStyle
      },
      children: [label, required && /*#__PURE__*/jsx("span", {
        style: {
          color: "#ef4444",
          fontWeight: 700
        },
        "aria-hidden": true,
        children: "*"
      })]
    }), /*#__PURE__*/jsx("div", {
      id: id,
      role: "group",
      "aria-labelledby": label ? `${id}-label` : undefined,
      "aria-required": required,
      "aria-invalid": hasError,
      "aria-describedby": hasError ? `${id}-error` : helperText ? `${id}-helper` : undefined,
      style: {
        display: "inline-flex",
        outline: hasError ? "2px solid #ef444440" : "none",
        borderRadius: 8,
        padding: hasError ? "4px 6px" : "0",
        transition: "outline 0.2s"
      },
      children: /*#__PURE__*/jsx(StarRating, {
        value: value ?? 0,
        onChange: handleChange,
        ...starProps
      })
    }), /*#__PURE__*/jsx("input", {
      type: "hidden",
      name: name,
      value: value ?? 0,
      "aria-hidden": true,
      readOnly: true
    }), hasError && /*#__PURE__*/jsxs("span", {
      id: `${id}-error`,
      role: "alert",
      style: {
        fontSize: 12,
        color: "#ef4444",
        display: "flex",
        alignItems: "center",
        gap: 4,
        ...errorStyle
      },
      children: [/*#__PURE__*/jsxs("svg", {
        viewBox: "0 0 24 24",
        width: 13,
        height: 13,
        "aria-hidden": true,
        children: [/*#__PURE__*/jsx("circle", {
          cx: "12",
          cy: "12",
          r: "10",
          fill: "#ef4444"
        }), /*#__PURE__*/jsx("path", {
          d: "M12 8v4M12 16h.01",
          stroke: "#fff",
          strokeWidth: 2,
          strokeLinecap: "round"
        })]
      }), errorMessage]
    }), !hasError && helperText && /*#__PURE__*/jsx("span", {
      id: `${id}-helper`,
      style: {
        fontSize: 12,
        color: "#64748b",
        ...helperStyle
      },
      children: helperText
    })]
  });
});

const StarRatingTooltip = /*#__PURE__*/forwardRef(function StarRatingTooltip({
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
  style = {}
}, ref) {
  const uid = React.useId();
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = isControlled ? controlledValue : internalValue;
  const [hoverIndex, setHoverIndex] = useState(null);
  const [hoverValue, setHoverValue] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({
    x: 0
  });
  const starRefs = useRef([]);
  const t = getThemeVars(theme);
  const filled = filledColor || t.filled;
  const empty = emptyColor || t.empty;
  const stroke = strokeColor || t.stroke;
  const sizeNum = typeof size === "number" ? size : parseInt(size, 10);
  const snapValue = React.useCallback(raw => precision === 0.5 ? Math.round(raw * 2) / 2 : Math.round(raw), [precision]);
  const getVal = React.useCallback((e, index) => {
    if (precision === 1) return index + 1;
    const rect = e.currentTarget.getBoundingClientRect();
    return snapValue(index + (e.clientX - rect.left < rect.width / 2 ? 0.5 : 1));
  }, [precision, snapValue]);
  const handleMouseMove = (e, index) => {
    if (readOnly || disabled) return;
    const val = getVal(e, index);
    setHoverValue(val);
    setHoverIndex(index);
    onHoverChange?.(val);
    if (starRefs.current[index]) {
      const rect = starRefs.current[index].getBoundingClientRect();
      setTooltipPos({
        x: rect.left + rect.width / 2
      });
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
  const handleKeyDown = e => {
    if (readOnly || disabled) return;
    const step = precision;
    let next = currentValue;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") next = Math.min(count, currentValue + step);else if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = Math.max(0, currentValue - step);else if (e.key === "Home") next = 0;else if (e.key === "End") next = count;else return;
    e.preventDefault();
    if (!isControlled) setInternalValue(next);
    onChange?.(next);
  };
  const displayValue = hoverValue ?? currentValue;
  const getFill = i => {
    const f = displayValue - i;
    if (f >= 1) return 1;
    if (f > 0 && precision === 0.5) return 0.5;
    return 0;
  };
  const starPath = getStarPath(shape);
  const tooltipLabel = hoverIndex !== null ? tooltips?.[hoverIndex] ?? `${hoverValue} star${hoverValue !== 1 ? "s" : ""}` : null;
  return /*#__PURE__*/jsxs("span", {
    ref: ref,
    className: `srx-root ${className}`,
    style: {
      display: "inline-flex",
      alignItems: "center",
      userSelect: "none",
      outline: "none",
      gap: `${gap}px`,
      flexDirection: direction === "rtl" ? "row-reverse" : "row",
      opacity: disabled ? 0.45 : 1,
      pointerEvents: disabled ? "none" : undefined,
      position: "relative",
      ...style
    },
    role: "slider",
    "aria-label": label,
    "aria-valuemin": 0,
    "aria-valuemax": count,
    "aria-valuenow": currentValue,
    "aria-valuetext": `${currentValue} out of ${count}`,
    "aria-disabled": disabled,
    "aria-readonly": readOnly,
    tabIndex: readOnly || disabled ? -1 : 0,
    onKeyDown: handleKeyDown,
    onMouseLeave: handleMouseLeave,
    children: [/*#__PURE__*/jsx("svg", {
      width: "0",
      height: "0",
      "aria-hidden": true,
      style: {
        position: "absolute"
      },
      children: /*#__PURE__*/jsx("defs", {
        children: Array.from({
          length: count
        }, (_, i) => /*#__PURE__*/jsxs("linearGradient", {
          id: `${uid}-g${i}`,
          x1: "0",
          x2: "1",
          y1: "0",
          y2: "0",
          children: [/*#__PURE__*/jsx("stop", {
            offset: `${getFill(i) * 100}%`,
            stopColor: filled
          }), /*#__PURE__*/jsx("stop", {
            offset: `${getFill(i) * 100}%`,
            stopColor: empty
          })]
        }, i))
      })
    }), hoverIndex !== null && tooltipLabel && /*#__PURE__*/jsxs("div", {
      "aria-hidden": true,
      style: {
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
        border: `1px solid ${filled}40`
      },
      children: [tooltipRenderer ? tooltipRenderer({
        value: hoverValue,
        label: tooltipLabel,
        index: hoverIndex
      }) : tooltipLabel, /*#__PURE__*/jsx("span", {
        style: {
          position: "absolute",
          [tooltipPlacement === "bottom" ? "top" : "bottom"]: -5,
          left: "50%",
          transform: "translateX(-50%)",
          width: 0,
          height: 0,
          borderLeft: "5px solid transparent",
          borderRight: "5px solid transparent",
          [tooltipPlacement === "bottom" ? "borderBottom" : "borderTop"]: "5px solid #1e293b"
        }
      })]
    }), Array.from({
      length: count
    }, (_, index) => {
      const fill = getFill(index);
      const fillColor = fill === 0 ? empty : fill === 1 ? filled : `url(#${uid}-g${index})`;
      const isSelected = highlightSelected && index + 1 === Math.ceil(currentValue);
      return /*#__PURE__*/jsxs("span", {
        ref: el => starRefs.current[index] = el,
        onClick: e => handleClick(e, index),
        onMouseMove: e => handleMouseMove(e, index),
        style: {
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: sizeNum,
          height: sizeNum,
          cursor: readOnly || disabled ? "default" : "pointer",
          position: "relative",
          transition: "transform 0.15s ease",
          animation: activeIndex === index && animation !== "none" ? `srx-${animation} 0.4s cubic-bezier(0.36,0.07,0.19,0.97)` : undefined
        },
        children: [isSelected && /*#__PURE__*/jsx("span", {
          style: {
            position: "absolute",
            inset: -3,
            borderRadius: "50%",
            border: `2px solid ${filled}`,
            opacity: 0.6,
            pointerEvents: "none"
          }
        }), /*#__PURE__*/jsx("svg", {
          viewBox: "0 0 24 24",
          width: sizeNum,
          height: sizeNum,
          "aria-hidden": true,
          focusable: "false",
          children: /*#__PURE__*/jsx("path", {
            d: starPath,
            fill: fillColor,
            stroke: stroke,
            strokeWidth: strokeWidth,
            strokeLinejoin: "round"
          })
        })]
      }, index);
    }), showValue && /*#__PURE__*/jsx("span", {
      "aria-hidden": true,
      style: {
        marginLeft: 8,
        fontVariantNumeric: "tabular-nums",
        fontSize: sizeNum * 0.5,
        lineHeight: 1,
        color: filled,
        fontWeight: 600,
        minWidth: "2.5ch"
      },
      children: displayValue.toFixed(precision === 0.5 ? 1 : 0)
    })]
  });
});

const RatingBadge = /*#__PURE__*/forwardRef(function RatingBadge({
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
  style = {}
}, ref) {
  const t = getThemeVars(theme);
  const color = filledColor || t.filled;
  const SIZES = {
    xs: {
      fontSize: 10,
      starSize: 10,
      px: 6,
      py: 2
    },
    sm: {
      fontSize: 12,
      starSize: 12,
      px: 8,
      py: 3
    },
    md: {
      fontSize: 13,
      starSize: 14,
      px: 10,
      py: 4
    },
    lg: {
      fontSize: 15,
      starSize: 16,
      px: 14,
      py: 6
    }
  };
  const s = SIZES[size] ?? SIZES.md;
  const formatCount = n => {
    if (!n && n !== 0) return null;
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
    return n.toLocaleString();
  };
  const starPath = "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";
  return /*#__PURE__*/jsxs("span", {
    ref: ref,
    className: `srx-badge ${className}`,
    onClick: onClick,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      paddingTop: s.py,
      paddingBottom: s.py,
      paddingLeft: s.px,
      paddingRight: s.px,
      borderRadius: pill ? 999 : 6,
      background: color + "18",
      border: `1px solid ${color}30`,
      cursor: onClick ? "pointer" : "default",
      fontWeight: 700,
      fontSize: s.fontSize,
      lineHeight: 1,
      userSelect: "none",
      ...style
    },
    title: count ? `${value} out of ${max} (${count} reviews)` : `${value} out of ${max}`,
    children: [showStar && /*#__PURE__*/jsx("svg", {
      viewBox: "0 0 24 24",
      width: s.starSize,
      height: s.starSize,
      "aria-hidden": true,
      children: /*#__PURE__*/jsx("path", {
        d: starPath,
        fill: color,
        stroke: "none"
      })
    }), /*#__PURE__*/jsx("span", {
      style: {
        color
      },
      children: typeof value === "number" ? value.toFixed(1) : value
    }), !compact && showCount && count !== undefined && /*#__PURE__*/jsxs("span", {
      style: {
        color: color,
        opacity: 0.6,
        fontSize: s.fontSize * 0.88
      },
      children: ["(", formatCount(count), ")"]
    })]
  });
});

const RatingSummary = /*#__PURE__*/forwardRef(function RatingSummary({
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
  style = {}
}, ref) {
  const t = getThemeVars(theme);
  const color = filledColor || t.filled;
  const [activeFilter, setActiveFilter] = useState(null);
  const handleFilter = star => {
    setActiveFilter(star);
    onFilter?.(star);
  };
  const formatTotal = n => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
    return n.toLocaleString();
  };
  return /*#__PURE__*/jsxs("div", {
    ref: ref,
    className: `srx-summary ${className}`,
    style: {
      display: "flex",
      flexDirection: "column",
      gap: compact ? 12 : 20,
      ...style
    },
    children: [/*#__PURE__*/jsxs("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: compact ? 12 : 20,
        flexWrap: "wrap"
      },
      children: [/*#__PURE__*/jsxs("div", {
        style: {
          textAlign: "center",
          flexShrink: 0
        },
        children: [/*#__PURE__*/jsx("div", {
          style: {
            fontSize: compact ? 40 : 56,
            fontWeight: 900,
            lineHeight: 1,
            color,
            fontVariantNumeric: "tabular-nums"
          },
          children: average.toFixed(1)
        }), /*#__PURE__*/jsx("div", {
          style: {
            marginTop: 6
          },
          children: /*#__PURE__*/jsx(StarRating, {
            value: average,
            precision: 0.5,
            readOnly: true,
            size: compact ? 16 : 20,
            theme: theme,
            filledColor: filledColor,
            gap: 3
          })
        }), total > 0 && /*#__PURE__*/jsxs("div", {
          style: {
            marginTop: 4,
            fontSize: 11,
            color: "#94a3b8",
            fontWeight: 500
          },
          children: [formatTotal(total), " review", total !== 1 ? "s" : ""]
        })]
      }), showDistribution && Object.keys(distribution).length > 0 && /*#__PURE__*/jsx("div", {
        style: {
          flex: 1,
          minWidth: 160
        },
        children: /*#__PURE__*/jsx(RatingDistribution, {
          data: distribution,
          total: total,
          theme: theme,
          filledColor: filledColor,
          showCount: !compact,
          showPercent: compact,
          compact: compact,
          onFilter: handleFilter,
          activeFilter: activeFilter
        })
      })]
    }), onWriteReview && /*#__PURE__*/jsx("button", {
      onClick: onWriteReview,
      style: {
        alignSelf: "flex-start",
        padding: "9px 20px",
        borderRadius: 10,
        background: color + "18",
        border: `1.5px solid ${color}40`,
        color,
        fontWeight: 700,
        fontSize: 13,
        cursor: "pointer",
        transition: "background 0.15s"
      },
      children: writeReviewLabel
    }), showReviews && reviews.length > 0 && /*#__PURE__*/jsx("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 12,
        borderTop: "1px solid #1e293b",
        paddingTop: 16
      },
      children: reviews.slice(0, maxReviews).map((r, i) => /*#__PURE__*/jsxs("div", {
        style: {
          padding: "14px 16px",
          borderRadius: 12,
          background: "#0f172a",
          border: "1px solid #1e293b",
          display: "flex",
          flexDirection: "column",
          gap: 8
        },
        children: [/*#__PURE__*/jsxs("div", {
          style: {
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap"
          },
          children: [r.avatar ? /*#__PURE__*/jsx("img", {
            src: r.avatar,
            alt: r.author,
            style: {
              width: 32,
              height: 32,
              borderRadius: "50%",
              objectFit: "cover",
              flexShrink: 0
            }
          }) : /*#__PURE__*/jsx("span", {
            style: {
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
              flexShrink: 0
            },
            children: (r.author ?? "?")[0].toUpperCase()
          }), /*#__PURE__*/jsxs("div", {
            style: {
              flex: 1,
              minWidth: 0
            },
            children: [/*#__PURE__*/jsxs("div", {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap"
              },
              children: [/*#__PURE__*/jsx("span", {
                style: {
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#f1f5f9"
                },
                children: r.author ?? "Anonymous"
              }), r.verified && /*#__PURE__*/jsx("span", {
                style: {
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#34d399",
                  background: "#34d39918",
                  border: "1px solid #34d39930",
                  borderRadius: 999,
                  padding: "1px 7px"
                },
                children: "\u2713 Verified"
              }), /*#__PURE__*/jsx("span", {
                style: {
                  marginLeft: "auto",
                  fontSize: 11,
                  color: "#475569"
                },
                children: r.date
              })]
            }), /*#__PURE__*/jsx(StarRating, {
              value: r.rating,
              precision: 0.5,
              readOnly: true,
              size: 13,
              theme: theme,
              filledColor: filledColor,
              gap: 2
            })]
          })]
        }), r.title && /*#__PURE__*/jsx("p", {
          style: {
            margin: 0,
            fontSize: 13,
            fontWeight: 700,
            color: "#e2e8f0"
          },
          children: r.title
        }), r.text && /*#__PURE__*/jsx("p", {
          style: {
            margin: 0,
            fontSize: 13,
            color: "#94a3b8",
            lineHeight: 1.6
          },
          children: r.text
        })]
      }, r.id ?? i))
    })]
  });
});

const RatingWall = /*#__PURE__*/forwardRef(function RatingWall({
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
  style = {}
}, ref) {
  const t = getThemeVars(theme);
  const color = filledColor || t.filled;
  const [visible, setVisible] = useState(maxItems);
  const [helpfulIds, setHelpfulIds] = useState(new Set());

  // sort
  const sorted = [...reviews].sort((a, b) => {
    if (sortBy === "highest") return b.rating - a.rating;
    if (sortBy === "lowest") return a.rating - b.rating;
    if (sortBy === "helpful") return (b.helpful ?? 0) - (a.helpful ?? 0);
    // recent — assume higher index = more recent, or use date string
    return 0;
  });

  // filter
  const filtered = filterStar !== null ? sorted.filter(r => Math.round(r.rating) === filterStar) : sorted;
  const shown = filtered.slice(0, visible);
  const handleHelpful = review => {
    if (helpfulIds.has(review.id)) return;
    setHelpfulIds(prev => new Set([...prev, review.id]));
    onHelpful?.(review);
  };
  if (filtered.length === 0) {
    return /*#__PURE__*/jsx("div", {
      ref: ref,
      className: className,
      style: {
        textAlign: "center",
        padding: "40px 20px",
        color: "#64748b",
        fontSize: 14,
        ...style
      },
      children: emptyText
    });
  }
  return /*#__PURE__*/jsxs("div", {
    ref: ref,
    className: `srx-wall ${className}`,
    style: {
      ...style
    },
    children: [/*#__PURE__*/jsx("div", {
      style: {
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: 16
      },
      children: shown.map((review, i) => /*#__PURE__*/jsx(ReviewCard, {
        review: review,
        color: color,
        theme: theme,
        filledColor: filledColor,
        isHelpful: helpfulIds.has(review.id),
        onHelpful: onHelpful ? () => handleHelpful(review) : null
      }, review.id ?? i))
    }), showMore && visible < filtered.length && /*#__PURE__*/jsx("div", {
      style: {
        textAlign: "center",
        marginTop: 24
      },
      children: /*#__PURE__*/jsxs("button", {
        onClick: () => setVisible(v => v + pageSize),
        style: {
          padding: "10px 28px",
          borderRadius: 10,
          background: color + "18",
          border: `1.5px solid ${color}30`,
          color,
          fontWeight: 700,
          fontSize: 13,
          cursor: "pointer",
          transition: "background 0.15s"
        },
        children: ["Load more (", filtered.length - visible, " remaining)"]
      })
    })]
  });
});
function ReviewCard({
  review,
  color,
  theme,
  filledColor,
  isHelpful,
  onHelpful
}) {
  const COLORS = {
    1: "#ef4444",
    2: "#f97316",
    3: "#eab308",
    4: "#22c55e",
    5: "#10b981"
  };
  const ratingColor = COLORS[Math.round(review.rating)] ?? color;
  return /*#__PURE__*/jsxs("div", {
    style: {
      padding: "16px",
      borderRadius: 14,
      border: "1px solid #1e293b",
      background: "#0f172a",
      display: "flex",
      flexDirection: "column",
      gap: 10,
      height: "100%",
      boxSizing: "border-box"
    },
    children: [/*#__PURE__*/jsxs("div", {
      style: {
        display: "flex",
        alignItems: "flex-start",
        gap: 10
      },
      children: [review.avatar ? /*#__PURE__*/jsx("img", {
        src: review.avatar,
        alt: review.author,
        style: {
          width: 36,
          height: 36,
          borderRadius: "50%",
          objectFit: "cover",
          flexShrink: 0
        }
      }) : /*#__PURE__*/jsx("span", {
        style: {
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: ratingColor + "28",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          fontWeight: 800,
          color: ratingColor,
          flexShrink: 0
        },
        children: (review.author ?? "?")[0].toUpperCase()
      }), /*#__PURE__*/jsxs("div", {
        style: {
          flex: 1,
          minWidth: 0
        },
        children: [/*#__PURE__*/jsxs("div", {
          style: {
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexWrap: "wrap"
          },
          children: [/*#__PURE__*/jsx("span", {
            style: {
              fontSize: 13,
              fontWeight: 700,
              color: "#f1f5f9",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap"
            },
            children: review.author ?? "Anonymous"
          }), review.verified && /*#__PURE__*/jsx("span", {
            style: {
              fontSize: 9,
              fontWeight: 700,
              color: "#34d399",
              background: "#34d39918",
              border: "1px solid #34d39930",
              borderRadius: 999,
              padding: "1px 6px",
              flexShrink: 0
            },
            children: "\u2713"
          })]
        }), /*#__PURE__*/jsxs("div", {
          style: {
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginTop: 2
          },
          children: [/*#__PURE__*/jsx(StarRating, {
            value: review.rating,
            precision: 0.5,
            readOnly: true,
            size: 12,
            theme: theme,
            filledColor: filledColor,
            gap: 1
          }), /*#__PURE__*/jsx("span", {
            style: {
              fontSize: 10,
              color: "#475569",
              flexShrink: 0
            },
            children: review.date
          })]
        })]
      }), /*#__PURE__*/jsx("span", {
        style: {
          flexShrink: 0,
          width: 30,
          height: 30,
          borderRadius: 8,
          background: ratingColor + "20",
          border: `1px solid ${ratingColor}30`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          fontWeight: 800,
          color: ratingColor
        },
        children: review.rating % 1 === 0 ? review.rating : review.rating.toFixed(1)
      })]
    }), review.title && /*#__PURE__*/jsx("p", {
      style: {
        margin: 0,
        fontSize: 13,
        fontWeight: 700,
        color: "#e2e8f0",
        lineHeight: 1.4
      },
      children: review.title
    }), review.text && /*#__PURE__*/jsx("p", {
      style: {
        margin: 0,
        fontSize: 12,
        color: "#94a3b8",
        lineHeight: 1.65,
        flex: 1
      },
      children: review.text
    }), onHelpful && /*#__PURE__*/jsx("button", {
      onClick: onHelpful,
      disabled: isHelpful,
      style: {
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
        transition: "all 0.15s"
      },
      children: isHelpful ? "✓ Helpful" : `👍 Helpful${review.helpful ? ` (${review.helpful})` : ""}`
    })]
  });
}

const RatingPrompt = /*#__PURE__*/forwardRef(function RatingPrompt({
  trigger = "time",
  delay = 5000,
  scrollPercent = 60,
  visible: externalVisible,
  message = "Enjoying the experience?",
  subMessage = "Your feedback helps us improve.",
  onRate,
  onDismiss,
  onLater,
  showLater = true,
  laterLabel = "Maybe later",
  dismissLabel = "×",
  submitLabel = "Submit",
  placement = "bottom-right",
  theme = "gold",
  count = 5,
  size = 36,
  animation = "bounce",
  rememberDismiss = true,
  storageKey = "srx:prompt-dismissed",
  className = "",
  style = {}
}, ref) {
  const t = getThemeVars(theme);
  const color = t.filled;
  const [show, setShow] = useState(false);
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    if (!rememberDismiss || typeof window === "undefined") return false;
    return localStorage.getItem(storageKey) === "1";
  });

  // trigger: time
  useEffect(() => {
    if (trigger !== "time" || dismissed) return;
    const id = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(id);
  }, [trigger, delay, dismissed]);

  // trigger: scroll
  useEffect(() => {
    if (trigger !== "scroll" || dismissed) return;
    const handler = () => {
      const scrolled = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
      if (scrolled >= scrollPercent) {
        setShow(true);
        window.removeEventListener("scroll", handler);
      }
    };
    window.addEventListener("scroll", handler, {
      passive: true
    });
    return () => window.removeEventListener("scroll", handler);
  }, [trigger, scrollPercent, dismissed]);

  // trigger: action (controlled externally)
  useEffect(() => {
    if (trigger === "action") setShow(!!externalVisible);
  }, [trigger, externalVisible]);
  const handleDismiss = useCallback(() => {
    setShow(false);
    if (rememberDismiss) {
      try {
        localStorage.setItem(storageKey, "1");
      } catch {/* */}
    }
    setDismissed(true);
    onDismiss?.();
  }, [rememberDismiss, storageKey, onDismiss]);
  const handleLater = useCallback(() => {
    setShow(false);
    onLater?.();
  }, [onLater]);
  const handleSubmit = useCallback(() => {
    if (rating === 0) return;
    setSubmitted(true);
    onRate?.(rating);
    setTimeout(() => setShow(false), 1800);
  }, [rating, onRate]);
  if (!show || dismissed) return null;
  const PLACEMENTS = {
    "bottom-right": {
      bottom: 24,
      right: 24
    },
    "bottom-left": {
      bottom: 24,
      left: 24
    },
    "bottom-center": {
      bottom: 24,
      left: "50%",
      transform: "translateX(-50%)"
    },
    "center": {
      top: "50%",
      left: "50%",
      transform: "translate(-50%,-50%)"
    }
  };
  const pos = PLACEMENTS[placement] ?? PLACEMENTS["bottom-right"];
  return /*#__PURE__*/jsxs("div", {
    ref: ref,
    className: `srx-prompt ${className}`,
    role: "dialog",
    "aria-label": "Rating prompt",
    style: {
      position: "fixed",
      zIndex: 9999,
      ...pos,
      minWidth: 280,
      maxWidth: 340,
      background: "#0f172a",
      border: `1px solid ${color}30`,
      borderRadius: 20,
      padding: "20px 24px",
      boxShadow: `0 20px 60px #00000060, 0 0 0 1px ${color}15`,
      display: "flex",
      flexDirection: "column",
      gap: 14,
      animation: "srx-prompt-in 0.3s cubic-bezier(0.34,1.56,0.64,1)",
      ...style
    },
    children: [/*#__PURE__*/jsx("button", {
      onClick: handleDismiss,
      "aria-label": "Dismiss",
      style: {
        position: "absolute",
        top: 10,
        right: 12,
        background: "none",
        border: "none",
        color: "#475569",
        fontSize: 18,
        cursor: "pointer",
        padding: "2px 6px",
        borderRadius: 6,
        lineHeight: 1
      },
      children: dismissLabel
    }), submitted ?
    /*#__PURE__*/
    /* thank you state */
    jsxs("div", {
      style: {
        textAlign: "center",
        padding: "8px 0"
      },
      children: [/*#__PURE__*/jsx("div", {
        style: {
          fontSize: 36,
          marginBottom: 8
        },
        children: "\uD83C\uDF89"
      }), /*#__PURE__*/jsx("p", {
        style: {
          margin: 0,
          fontWeight: 700,
          color: "#f1f5f9",
          fontSize: 15
        },
        children: "Thank you!"
      }), /*#__PURE__*/jsx("p", {
        style: {
          margin: "4px 0 0",
          color: "#64748b",
          fontSize: 13
        },
        children: "Your rating has been submitted."
      })]
    }) : /*#__PURE__*/jsxs(Fragment, {
      children: [/*#__PURE__*/jsxs("div", {
        style: {
          paddingRight: 24
        },
        children: [/*#__PURE__*/jsx("p", {
          style: {
            margin: 0,
            fontWeight: 800,
            fontSize: 15,
            color: "#f1f5f9"
          },
          children: message
        }), subMessage && /*#__PURE__*/jsx("p", {
          style: {
            margin: "4px 0 0",
            fontSize: 12,
            color: "#64748b"
          },
          children: subMessage
        })]
      }), /*#__PURE__*/jsx("div", {
        style: {
          display: "flex",
          justifyContent: "center"
        },
        children: /*#__PURE__*/jsx(StarRating, {
          value: rating,
          onChange: setRating,
          count: count,
          size: size,
          theme: theme,
          animation: animation
        })
      }), /*#__PURE__*/jsxs("div", {
        style: {
          display: "flex",
          gap: 8,
          alignItems: "center"
        },
        children: [/*#__PURE__*/jsx("button", {
          onClick: handleSubmit,
          disabled: rating === 0,
          style: {
            flex: 1,
            padding: "9px 0",
            borderRadius: 10,
            background: rating > 0 ? `linear-gradient(135deg, ${color}, ${color}cc)` : "#1e293b",
            border: "none",
            color: rating > 0 ? "#fff" : "#475569",
            fontWeight: 700,
            fontSize: 13,
            cursor: rating > 0 ? "pointer" : "not-allowed",
            transition: "all 0.2s"
          },
          children: submitLabel
        }), showLater && /*#__PURE__*/jsx("button", {
          onClick: handleLater,
          style: {
            padding: "9px 14px",
            borderRadius: 10,
            background: "transparent",
            border: "1px solid #1e293b",
            color: "#64748b",
            fontWeight: 600,
            fontSize: 12,
            cursor: "pointer",
            whiteSpace: "nowrap"
          },
          children: laterLabel
        })]
      })]
    })]
  });
});

/**
 * useRating — standalone hook for managing rating state.
 *
 * @param {object} options
 * @param {number} options.initialValue
 * @param {number} options.count        total stars
 * @param {number} options.precision    1 or 0.5
 * @param {function} options.onChange
 *
 * @returns {{ value, hoverValue, handlers }}
 */
function useRating({
  initialValue = 0,
  count = 5,
  precision = 1,
  onChange
} = {}) {
  const [value, setValue] = useState(initialValue);
  const [hoverValue, setHoverValue] = useState(null);
  const set = useCallback(next => {
    const clamped = Math.max(0, Math.min(count, next));
    setValue(clamped);
    onChange?.(clamped);
  }, [count, onChange]);
  const reset = useCallback(() => set(0), [set]);
  const handlers = {
    onChange: set,
    onHoverChange: setHoverValue
  };
  return {
    value,
    hoverValue,
    set,
    reset,
    handlers
  };
}

/**
 * useRatingField — deep integration hook for form libraries.
 *
 * Works with React Hook Form, Formik, Zod validation, and plain state.
 *
 * @param {object} options
 * @param {number}   options.initialValue    Starting value (default 0)
 * @param {number}   options.count           Max stars (default 5)
 * @param {number}   options.precision       1 or 0.5 (default 1)
 * @param {number}   options.minValue        Minimum valid value (default 0 = optional, 1 = required)
 * @param {number}   options.maxValue        Maximum valid value (default count)
 * @param {boolean}  options.required        Adds a "required" validation
 * @param {string}   options.requiredMessage Custom required error message
 * @param {string}   options.minMessage      Custom min error message
 * @param {function} options.validate        Custom validator: (value) => string|null
 * @param {function} options.onChange        External onChange callback
 *
 * @returns {object} { value, error, touched, isDirty, isValid, handlers, field, reset, validate }
 *
 * ─── React Hook Form ──────────────────────────────────────────────────────────
 * <Controller
 *   name="rating"
 *   control={control}
 *   rules={{ required: "Please rate", min: { value: 1, message: "At least 1 star" } }}
 *   render={({ field, fieldState }) => (
 *     <StarRatingInput
 *       {...field}
 *       errorMessage={fieldState.error?.message}
 *       required
 *     />
 *   )}
 * />
 *
 * ─── useRatingField (standalone validation) ───────────────────────────────────
 * const rating = useRatingField({ required: true, minValue: 1 });
 * <StarRatingInput
 *   {...rating.field}
 *   errorMessage={rating.touched ? rating.error : undefined}
 * />
 */
function useRatingField({
  initialValue = 0,
  count = 5,
  precision = 1,
  minValue = 0,
  maxValue,
  required = false,
  requiredMessage = "A rating is required.",
  minMessage,
  validate: customValidate,
  onChange: externalOnChange
} = {}) {
  const [value, setValue] = useState(initialValue);
  const [touched, setTouched] = useState(false);
  const max = maxValue ?? count;
  const runValidation = useCallback(val => {
    if (required && (val === 0 || val === undefined || val === null)) {
      return requiredMessage;
    }
    if (minValue > 0 && val < minValue) {
      return minMessage ?? `Please select at least ${minValue} star${minValue !== 1 ? "s" : ""}.`;
    }
    if (customValidate) {
      const msg = customValidate(val);
      if (msg) return msg;
    }
    return null;
  }, [required, requiredMessage, minValue, minMessage, customValidate]);
  const error = runValidation(value);
  const isValid = error === null;
  const isDirty = value !== initialValue;
  const handleChange = useCallback(val => {
    const clamped = Math.max(0, Math.min(max, val));
    setValue(clamped);
    setTouched(true);
    externalOnChange?.(clamped);
  }, [max, externalOnChange]);
  const handleBlur = useCallback(() => setTouched(true), []);
  const reset = useCallback(() => {
    setValue(initialValue);
    setTouched(false);
  }, [initialValue]);
  const revalidate = useCallback(() => runValidation(value), [runValidation, value]);

  /** field — spread directly onto StarRatingInput or StarRating */
  const field = {
    value,
    onChange: handleChange,
    onBlur: handleBlur
  };

  /** handlers — spread onto StarRating (no onBlur) */
  const handlers = {
    value,
    onChange: handleChange,
    onHoverChange: () => {}
  };
  return {
    value,
    error,
    touched,
    isDirty,
    isValid,
    field,
    handlers,
    reset,
    validate: revalidate,
    // meta helpers
    showError: touched && !!error,
    errorMessage: touched ? error : null
  };
}

/**
 * useRatingAnalytics — compute rich insights from an array of rating values.
 *
 * @param {number[]} ratings   Array of numeric ratings e.g. [5,4,5,3,5,2,4]
 * @param {object}  options
 * @param {number}  options.max          Max star value (default 5)
 * @param {number}  options.positiveMin  Threshold for "positive" (default 4)
 * @param {number}  options.negativeMax  Threshold for "negative" (default 2)
 *
 * @returns {AnalyticsResult}
 */
function useRatingAnalytics(ratings = [], {
  max = 5,
  positiveMin = 4,
  negativeMax = 2
} = {}) {
  return useMemo(() => {
    if (!ratings || ratings.length === 0) {
      return {
        count: 0,
        average: 0,
        median: 0,
        mode: 0,
        min: 0,
        max: 0,
        stdDev: 0,
        nps: 0,
        trend: "stable",
        percentPositive: 0,
        percentNegative: 0,
        percentNeutral: 100,
        distribution: {},
        distributionPercent: {},
        topScore: 0,
        bottomScore: 0,
        recentTrend: "stable"
      };
    }
    const count = ratings.length;

    // ── distribution ──────────────────────────────────────────────────────────
    const distribution = {};
    for (let i = 1; i <= max; i++) distribution[i] = 0;
    for (const r of ratings) {
      const key = Math.round(r);
      if (key >= 1 && key <= max) distribution[key]++;
    }
    const distributionPercent = {};
    for (const k in distribution) {
      distributionPercent[k] = +(distribution[k] / count * 100).toFixed(1);
    }

    // ── average ───────────────────────────────────────────────────────────────
    const sum = ratings.reduce((a, b) => a + b, 0);
    const average = +(sum / count).toFixed(2);

    // ── median ────────────────────────────────────────────────────────────────
    const sorted = [...ratings].sort((a, b) => a - b);
    const mid = Math.floor(count / 2);
    const median = count % 2 !== 0 ? sorted[mid] : +((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2);

    // ── mode ──────────────────────────────────────────────────────────────────
    let mode = 0,
      maxFreq = 0;
    for (const [k, v] of Object.entries(distribution)) {
      if (v > maxFreq) {
        maxFreq = v;
        mode = +k;
      }
    }

    // ── std deviation ─────────────────────────────────────────────────────────
    const variance = ratings.reduce((acc, r) => acc + Math.pow(r - average, 2), 0) / count;
    const stdDev = +Math.sqrt(variance).toFixed(2);

    // ── positive / negative / neutral ─────────────────────────────────────────
    const positives = ratings.filter(r => r >= positiveMin).length;
    const negatives = ratings.filter(r => r <= negativeMax).length;
    const percentPositive = +(positives / count * 100).toFixed(1);
    const percentNegative = +(negatives / count * 100).toFixed(1);
    const percentNeutral = +(100 - percentPositive - percentNegative).toFixed(1);

    // ── NPS (Net Promoter Score) ───────────────────────────────────────────────
    // Promoters: 5 stars, Detractors: 1-2 stars, Passives: 3-4 stars
    const promoters = ratings.filter(r => r >= max).length;
    const detractors = ratings.filter(r => r <= 2).length;
    const nps = Math.round((promoters - detractors) / count * 100);

    // ── trend (compare first half vs second half) ─────────────────────────────
    const half = Math.floor(count / 2);
    const firstHalf = ratings.slice(0, half);
    const secHalf = ratings.slice(half);
    const avgFirst = firstHalf.length ? firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length : average;
    const avgSec = secHalf.length ? secHalf.reduce((a, b) => a + b, 0) / secHalf.length : average;
    const diff = avgSec - avgFirst;
    const trend = diff > 0.2 ? "improving" : diff < -0.2 ? "declining" : "stable";

    // ── recent trend (last 20% vs previous 20%) ───────────────────────────────
    const slice = Math.max(1, Math.floor(count * 0.2));
    const recent = ratings.slice(-slice);
    const prevRecent = ratings.slice(-slice * 2, -slice);
    const avgRecent = recent.reduce((a, b) => a + b, 0) / recent.length;
    const avgPrev = prevRecent.length ? prevRecent.reduce((a, b) => a + b, 0) / prevRecent.length : avgRecent;
    const rDiff = avgRecent - avgPrev;
    const recentTrend = rDiff > 0.15 ? "improving" : rDiff < -0.15 ? "declining" : "stable";

    // ── top / bottom ──────────────────────────────────────────────────────────
    const topScore = sorted[count - 1];
    const bottomScore = sorted[0];
    return {
      count,
      average,
      median,
      mode,
      min: bottomScore,
      max: topScore,
      stdDev,
      nps,
      trend,
      recentTrend,
      percentPositive,
      percentNegative,
      percentNeutral,
      distribution,
      distributionPercent,
      topScore,
      bottomScore
    };
  }, [ratings, max, positiveMin, negativeMax]);
}

/**
 * useRatingGroupAnalytics — analytics per category in a RatingGroup.
 *
 * @param {Record<string, number[]>} categoryRatings
 *   e.g. { quality: [5,4,5,3], service: [4,3,4,5] }
 *
 * @returns {Record<string, AnalyticsResult> & { topRated, weakestRated, overallAverage }}
 */
function useRatingGroupAnalytics(categoryRatings = {}, options = {}) {
  return useMemo(() => {
    const results = {};
    for (const [key, vals] of Object.entries(categoryRatings)) {
      const arr = Array.isArray(vals) ? vals : [vals];
      const count = arr.length;
      const avg = count ? arr.reduce((a, b) => a + b, 0) / count : 0;
      results[key] = {
        average: +avg.toFixed(2),
        count
      };
    }
    const entries = Object.entries(results);
    const topRated = entries.sort((a, b) => b[1].average - a[1].average)[0]?.[0] ?? null;
    const weakestRated = entries.sort((a, b) => a[1].average - b[1].average)[0]?.[0] ?? null;
    const allAvgs = Object.values(results).map(r => r.average);
    const overallAverage = allAvgs.length ? +(allAvgs.reduce((a, b) => a + b, 0) / allAvgs.length).toFixed(2) : 0;
    return {
      ...results,
      topRated,
      weakestRated,
      overallAverage
    };
  }, [categoryRatings]);
}

/**
 * useRatingPersistence — persist a rating value in localStorage.
 *
 * @param {string}  key          Storage key (e.g. "product-123")
 * @param {object}  options
 * @param {number}  options.defaultValue  Initial value if nothing stored (default 0)
 * @param {number}  options.ttl           Time-to-live in ms — clears after this time (optional)
 * @param {string}  options.namespace     Key prefix (default "srx:")
 * @param {fn}      options.onLoad        Called with the loaded value on mount
 * @param {fn}      options.onChange      External onChange callback
 *
 * @returns {{ value, onChange, reset, isLoaded, storedAt }}
 *
 * Usage:
 *  const { value, onChange } = useRatingPersistence("product-abc-123");
 *  <StarRating value={value} onChange={onChange} />
 */
function useRatingPersistence(key, {
  defaultValue = 0,
  ttl,
  namespace = "srx:",
  onLoad,
  onChange: externalOnChange
} = {}) {
  const storageKey = `${namespace}${key}`;
  const readFromStorage = useCallback(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      // check TTL
      if (ttl && parsed.storedAt) {
        if (Date.now() - parsed.storedAt > ttl) {
          localStorage.removeItem(storageKey);
          return null;
        }
      }
      return parsed;
    } catch {
      return null;
    }
  }, [storageKey, ttl]);
  const [state, setState] = useState(() => {
    const stored = readFromStorage();
    return {
      value: stored?.value ?? defaultValue,
      storedAt: stored?.storedAt ?? null,
      isLoaded: stored !== null
    };
  });

  // notify onLoad after mount
  useEffect(() => {
    if (state.isLoaded) onLoad?.(state.value);
  }, []); // eslint-disable-line

  const handleChange = useCallback(val => {
    const storedAt = Date.now();
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        value: val,
        storedAt
      }));
    } catch {
      // storage might be full — fail silently
    }
    setState({
      value: val,
      storedAt,
      isLoaded: true
    });
    externalOnChange?.(val);
  }, [storageKey, externalOnChange]);
  const reset = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch {/* */}
    setState({
      value: defaultValue,
      storedAt: null,
      isLoaded: false
    });
    externalOnChange?.(defaultValue);
  }, [storageKey, defaultValue, externalOnChange]);
  return {
    value: state.value,
    onChange: handleChange,
    reset,
    isLoaded: state.isLoaded,
    storedAt: state.storedAt
  };
}

/**
 * useRatingExport — export ratings data as CSV or JSON.
 *
 * @param {RatingRecord[]} data
 * @param {object} options
 * @param {string} options.filename   Base filename without extension (default "ratings")
 * @param {string[]} options.csvFields  Fields to include in CSV (default all)
 *
 * RatingRecord can be any object — common shape:
 *  { id, author, rating, date, category, text }
 *
 * @returns {{ exportCSV, exportJSON, copyJSON }}
 */
function useRatingExport(data = [], {
  filename = "ratings",
  csvFields
} = {}) {
  const exportJSON = useCallback(() => {
    const json = JSON.stringify(data, null, 2);
    download(`${filename}.json`, json, "application/json");
  }, [data, filename]);
  const exportCSV = useCallback(() => {
    if (data.length === 0) return;
    const fields = csvFields ?? Object.keys(data[0]);
    const header = fields.join(",");
    const rows = data.map(record => fields.map(f => {
      const val = record[f] ?? "";
      const str = String(val).replace(/"/g, '""');
      return str.includes(",") || str.includes("\n") || str.includes('"') ? `"${str}"` : str;
    }).join(","));
    const csv = [header, ...rows].join("\n");
    download(`${filename}.csv`, csv, "text/csv");
  }, [data, filename, csvFields]);
  const copyJSON = useCallback(async () => {
    const json = JSON.stringify(data, null, 2);
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(json);
      return true;
    }
    return false;
  }, [data]);
  return {
    exportCSV,
    exportJSON,
    copyJSON
  };
}
function download(filename, content, mimeType) {
  if (typeof document === "undefined") return;
  const blob = new Blob([content], {
    type: mimeType
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export { RatingBadge, RatingDistribution, RatingGroup, RatingPrompt, RatingSummary, RatingWall, SHAPE_PATHS, StarRating, StarRatingInput, StarRatingTooltip, THEME_NAMES, StarRating as default, getStarPath, getThemeVars, useRating, useRatingAnalytics, useRatingExport, useRatingField, useRatingGroupAnalytics, useRatingPersistence };
//# sourceMappingURL=index.esm.js.map
