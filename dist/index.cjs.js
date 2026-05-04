'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var react = require('react');
var jsxRuntime = require('react/jsx-runtime');

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

const StarRating = /*#__PURE__*/react.forwardRef(function StarRating({
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
  // emoji/text/render-fn — renders instead of SVG
  customIcon,
  // SVG path string or render-fn — replaces built-in shape

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
  style = {}
}, ref) {
  const uid = react.useId();

  // ── state ──────────────────────────────────────────────────────────────────
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = react.useState(defaultValue);
  const currentValue = isControlled ? controlledValue : internalValue;
  const [hoverValue, setHoverValue] = react.useState(null);
  const [activeIndex, setActiveIndex] = react.useState(null);

  // mount animation: animatedValue goes from 0 → currentValue on first render
  const [animatedValue, setAnimatedValue] = react.useState(mountAnimation ? 0 : null);
  react.useEffect(() => {
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

  // ── value helpers ──────────────────────────────────────────────────────────
  const snapValue = react.useCallback(raw => precision === 0.5 ? Math.round(raw * 2) / 2 : Math.round(raw), [precision]);
  const getValueFromPointer = react.useCallback((e, index) => {
    if (precision === 1) return index + 1;
    const rect = e.currentTarget.getBoundingClientRect();
    const half = e.clientX - rect.left < rect.width / 2;
    return snapValue(index + (half ? 0.5 : 1));
  }, [precision, snapValue]);

  // ── interaction handlers ───────────────────────────────────────────────────
  const handleMouseMove = react.useCallback((e, index) => {
    if (readOnly || disabled) return;
    const val = getValueFromPointer(e, index);
    setHoverValue(val);
    onHoverChange?.(val);
  }, [readOnly, disabled, getValueFromPointer, onHoverChange]);
  const handleMouseLeave = react.useCallback(() => {
    if (readOnly || disabled) return;
    setHoverValue(null);
    onHoverChange?.(null);
  }, [readOnly, disabled, onHoverChange]);
  const handleClick = react.useCallback((e, index) => {
    if (readOnly || disabled) return;
    const val = getValueFromPointer(e, index);
    const next = allowClear && val === currentValue ? 0 : val;
    setActiveIndex(index);
    setTimeout(() => setActiveIndex(null), 500);
    if (!isControlled) setInternalValue(next);
    onChange?.(next);
  }, [readOnly, disabled, getValueFromPointer, allowClear, currentValue, isControlled, onChange]);
  const handleKeyDown = react.useCallback(e => {
    if (readOnly || disabled) return;
    const step = precision;
    let next = currentValue;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") next = Math.min(count, currentValue + step);else if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = Math.max(0, currentValue - step);else if (e.key === "Home") next = 0;else if (e.key === "End") next = count;else return;
    e.preventDefault();
    if (!isControlled) setInternalValue(next);
    onChange?.(next);
  }, [readOnly, disabled, precision, currentValue, count, isControlled, onChange]);

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
    const fillColor = fill === 0 ? resolvedEmpty : fill === 1 ? resolvedFilled : `url(#${uid}-g${index})`;

    // 1️⃣  character mode — emoji or text
    if (character !== undefined) {
      const charContent = typeof character === "function" ? character({
        fill,
        index,
        filled: resolvedFilled,
        empty: resolvedEmpty
      }) : character;
      return /*#__PURE__*/jsxRuntime.jsx("span", {
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
      return /*#__PURE__*/jsxRuntime.jsx("svg", {
        viewBox: "0 0 24 24",
        width: sizeNum,
        height: sizeNum,
        "aria-hidden": true,
        focusable: "false",
        children: /*#__PURE__*/jsxRuntime.jsx("path", {
          d: customIcon,
          fill: fillColor,
          stroke: resolvedStroke,
          strokeWidth: strokeWidth,
          strokeLinejoin: "round"
        })
      });
    }

    // 3️⃣  default built-in shape
    return /*#__PURE__*/jsxRuntime.jsx("svg", {
      viewBox: "0 0 24 24",
      width: sizeNum,
      height: sizeNum,
      "aria-hidden": true,
      focusable: "false",
      children: /*#__PURE__*/jsxRuntime.jsx("path", {
        d: getStarPath(shape),
        fill: fillColor,
        stroke: resolvedStroke,
        strokeWidth: strokeWidth,
        strokeLinejoin: "round"
      })
    });
  };

  // ── render ─────────────────────────────────────────────────────────────────
  return /*#__PURE__*/jsxRuntime.jsxs("span", {
    ref: ref,
    className: `srx-root ${disabled ? "srx-disabled" : ""} ${className}`,
    style: {
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
    children: [/*#__PURE__*/jsxRuntime.jsx("svg", {
      width: "0",
      height: "0",
      "aria-hidden": true,
      style: {
        position: "absolute"
      },
      children: /*#__PURE__*/jsxRuntime.jsx("defs", {
        children: Array.from({
          length: count
        }, (_, i) => /*#__PURE__*/jsxRuntime.jsxs("linearGradient", {
          id: `${uid}-g${i}`,
          x1: "0",
          x2: "1",
          y1: "0",
          y2: "0",
          children: [/*#__PURE__*/jsxRuntime.jsx("stop", {
            offset: `${getFill(i) * 100}%`,
            stopColor: resolvedFilled
          }), /*#__PURE__*/jsxRuntime.jsx("stop", {
            offset: `${getFill(i) * 100}%`,
            stopColor: resolvedEmpty
          })]
        }, i))
      })
    }), Array.from({
      length: count
    }, (_, index) => {
      const isSelected = highlightSelected && index + 1 === Math.ceil(currentValue);
      const tooltip = tooltips?.[index] ?? `${index + 1} star${index !== 0 ? "s" : ""}`;
      return /*#__PURE__*/jsxRuntime.jsx("span", {
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
    }), showValue && /*#__PURE__*/jsxRuntime.jsx("span", {
      className: "srx-value",
      "aria-hidden": "true",
      children: displayValue.toFixed(precision === 0.5 ? 1 : 0)
    })]
  });
});

const RatingGroup = /*#__PURE__*/react.forwardRef(function RatingGroup({
  categories = [],
  values: controlledValues,
  defaultValues = {},
  onChange,
  showAverage = false,
  showValues = false,
  labelWidth = 120,
  gap = 6,
  size = 28,
  theme = "gold",
  ...starProps
}, ref) {
  const isControlled = controlledValues !== undefined;
  const [internalValues, setInternalValues] = react.useState(() => {
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
  return /*#__PURE__*/jsxRuntime.jsxs("div", {
    ref: ref,
    className: "srx-group",
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    },
    children: [categories.map(({
      key,
      label
    }) => /*#__PURE__*/jsxRuntime.jsxs("div", {
      className: "srx-group-row",
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12
      },
      children: [/*#__PURE__*/jsxRuntime.jsx("span", {
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
      }), /*#__PURE__*/jsxRuntime.jsx(StarRating, {
        value: currentValues[key] ?? 0,
        onChange: val => handleChange(key, val),
        size: size,
        gap: gap,
        theme: theme,
        showValue: showValues,
        ...starProps
      })]
    }, key)), showAverage && categories.length > 0 && /*#__PURE__*/jsxRuntime.jsxs("div", {
      className: "srx-group-average",
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        paddingTop: 8,
        borderTop: "1px solid #e5e7eb",
        marginTop: 4
      },
      children: [/*#__PURE__*/jsxRuntime.jsx("span", {
        style: {
          width: labelWidth,
          flexShrink: 0,
          fontSize: size * 0.44,
          fontWeight: 700,
          color: "inherit"
        },
        children: "Overall"
      }), /*#__PURE__*/jsxRuntime.jsx(StarRating, {
        value: +average.toFixed(1),
        precision: 0.5,
        size: size,
        gap: gap,
        theme: theme,
        readOnly: true,
        showValue: true
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
  const [value, setValue] = react.useState(initialValue);
  const [hoverValue, setHoverValue] = react.useState(null);
  const set = react.useCallback(next => {
    const clamped = Math.max(0, Math.min(count, next));
    setValue(clamped);
    onChange?.(clamped);
  }, [count, onChange]);
  const reset = react.useCallback(() => set(0), [set]);
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

exports.RatingGroup = RatingGroup;
exports.SHAPE_PATHS = SHAPE_PATHS;
exports.StarRating = StarRating;
exports.THEME_NAMES = THEME_NAMES;
exports.default = StarRating;
exports.getStarPath = getStarPath;
exports.getThemeVars = getThemeVars;
exports.useRating = useRating;
//# sourceMappingURL=index.cjs.js.map
