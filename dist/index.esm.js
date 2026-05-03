import { forwardRef, useId, useState, useRef, useCallback } from 'react';
import { jsxs, jsx } from 'react/jsx-runtime';

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
  style = {}
}, ref) {
  const uid = useId();
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = isControlled ? controlledValue : internalValue;
  const [hoverValue, setHoverValue] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null); // for animation
  useRef(null);
  const themeVars = getThemeVars(theme);
  const resolvedFilled = filledColor || themeVars.filled;
  const resolvedEmpty = emptyColor || themeVars.empty;
  const resolvedStroke = strokeColor || themeVars.stroke;
  const sizeNum = typeof size === "number" ? size : parseInt(size, 10);

  // ── value helpers ──────────────────────────────────────────────────────────
  const snapValue = useCallback(raw => {
    if (precision === 0.5) return Math.round(raw * 2) / 2;
    return Math.round(raw);
  }, [precision]);
  const getValueFromPointer = useCallback((e, index) => {
    if (precision === 1) return index + 1;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const half = x < rect.width / 2;
    const raw = index + (half ? 0.5 : 1);
    return snapValue(raw);
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
    setActiveIndex(index);
    setTimeout(() => setActiveIndex(null), 400);
    if (!isControlled) setInternalValue(next);
    onChange?.(next);
  }, [readOnly, disabled, getValueFromPointer, allowClear, currentValue, isControlled, onChange]);

  // keyboard support
  const handleKeyDown = useCallback(e => {
    if (readOnly || disabled) return;
    const step = precision;
    let next = currentValue;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") next = Math.min(count, currentValue + step);else if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = Math.max(0, currentValue - step);else if (e.key === "Home") next = 0;else if (e.key === "End") next = count;else return;
    e.preventDefault();
    if (!isControlled) setInternalValue(next);
    onChange?.(next);
  }, [readOnly, disabled, precision, currentValue, count, isControlled, onChange]);

  // ── rendering helpers ──────────────────────────────────────────────────────
  const displayValue = hoverValue ?? currentValue;
  const getFill = index => {
    const filled = displayValue - index;
    if (filled >= 1) return 1;
    if (filled > 0 && precision === 0.5) return 0.5;
    return 0;
  };
  const starPath = getStarPath(shape);

  // ── render ─────────────────────────────────────────────────────────────────
  return /*#__PURE__*/jsxs("span", {
    ref: ref,
    className: `srx-root ${disabled ? "srx-disabled" : ""} ${className}`,
    style: {
      ...themeVars.cssVars,
      "--srx-filled": resolvedFilled,
      "--srx-empty": resolvedEmpty,
      "--srx-stroke": resolvedStroke,
      "--srx-size": `${sizeNum}px`,
      "--srx-gap": `${gap}px`,
      gap: `${gap}px`,
      flexDirection: direction === "rtl" ? "row-reverse" : "row",
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
      "aria-hidden": "true",
      focusable: "false",
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
            stopColor: resolvedFilled
          }), /*#__PURE__*/jsx("stop", {
            offset: `${getFill(i) * 100}%`,
            stopColor: resolvedEmpty
          })]
        }, i))
      })
    }), Array.from({
      length: count
    }, (_, index) => {
      const fill = getFill(index);
      const isSelected = highlightSelected && index + 1 === Math.ceil(currentValue);
      const tooltip = tooltips?.[index] ?? `${index + 1} star${index !== 0 ? "s" : ""}`;
      return /*#__PURE__*/jsx("span", {
        className: `srx-star ${activeIndex === index ? `srx-anim-${animation}` : ""} ${isSelected ? "srx-selected" : ""}`,
        style: {
          width: sizeNum,
          height: sizeNum
        },
        title: tooltip,
        "aria-label": tooltip,
        onClick: e => handleClick(e, index),
        onMouseMove: e => handleMouseMove(e, index),
        children: /*#__PURE__*/jsx("svg", {
          viewBox: "0 0 24 24",
          width: sizeNum,
          height: sizeNum,
          xmlns: "http://www.w3.org/2000/svg",
          "aria-hidden": "true",
          focusable: "false",
          children: /*#__PURE__*/jsx("path", {
            d: starPath,
            fill: fill === 0 ? resolvedEmpty : fill === 1 ? resolvedFilled : `url(#${uid}-g${index})`,
            stroke: resolvedStroke,
            strokeWidth: strokeWidth,
            strokeLinejoin: "round"
          })
        })
      }, index);
    }), showValue && /*#__PURE__*/jsx("span", {
      className: "srx-value",
      "aria-hidden": "true",
      children: displayValue.toFixed(precision === 0.5 ? 1 : 0)
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

export { SHAPE_PATHS, StarRating, THEME_NAMES, StarRating as default, getStarPath, getThemeVars, useRating };
//# sourceMappingURL=index.esm.js.map
