import React, { useState, forwardRef } from "react";
import StarRating from "./StarRating.jsx";

/**
 * RatingGroup — rate multiple categories at once.
 *
 * Props:
 *  categories      {Array<{key, label}>}    List of categories to rate
 *  values          {Record<string,number>}  Controlled values map
 *  defaultValues   {Record<string,number>}  Uncontrolled initial values
 *  onChange        {fn(key, value, allValues)}
 *  showAverage     {bool}    Show average row at the bottom (default false)
 *  overallLabel    {string}  Text for the average row (default "Overall")
 *  averagePrecision {0.5|1}  Precision of the average stars (default 0.5)
 *  showValues      {bool}    Show numeric value per row (default false)
 *  labelWidth      {number}  Width of the label column in px (default 120)
 *  rowGap          {number}  Gap between rows in px (default 12)
 *  dividerColor    {string}  Colour of the divider above the average row
 *  averageLabelStyle {object} Extra style for the overall label
 *  -- All other StarRating props are forwarded to every row --
 */
const RatingGroup = forwardRef(function RatingGroup(
  {
    categories = [],
    values: controlledValues,
    defaultValues = {},
    onChange,
    showAverage = false,
    overallLabel = "Overall",          // ← NEW: fully customisable label
    averagePrecision = 0.5,            // ← NEW: precision for the average row
    showValues = false,
    labelWidth = 120,
    rowGap = 12,                       // ← NEW: gap between rows
    dividerColor = "#e5e7eb",          // ← NEW: divider colour
    averageLabelStyle = {},            // ← NEW: custom style for overall label
    gap = 6,
    size = 28,
    theme = "gold",
    ...starProps
  },
  ref
) {
  const isControlled = controlledValues !== undefined;
  const [internalValues, setInternalValues] = useState(() => {
    const init = {};
    categories.forEach(({ key }) => {
      init[key] = defaultValues[key] ?? 0;
    });
    return init;
  });

  const currentValues = isControlled ? controlledValues : internalValues;

  const handleChange = (key, val) => {
    const next = { ...currentValues, [key]: val };
    if (!isControlled) setInternalValues(next);
    onChange?.(key, val, next);
  };

  const average =
    categories.length > 0
      ? categories.reduce((sum, { key }) => sum + (currentValues[key] ?? 0), 0) /
        categories.length
      : 0;

  return (
    <div
      ref={ref}
      className="srx-group"
      style={{ display: "flex", flexDirection: "column", gap: rowGap }}
    >
      {categories.map(({ key, label }) => (
        <div
          key={key}
          className="srx-group-row"
          style={{ display: "flex", alignItems: "center", gap: 12 }}
        >
          {/* label */}
          <span
            className="srx-group-label"
            style={{
              width: labelWidth,
              flexShrink: 0,
              fontSize: size * 0.44,
              color: "inherit",
              fontWeight: 500,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </span>

          {/* stars */}
          <StarRating
            value={currentValues[key] ?? 0}
            onChange={(val) => handleChange(key, val)}
            size={size}
            gap={gap}
            theme={theme}
            showValue={showValues}
            {...starProps}
          />
        </div>
      ))}

      {/* average row */}
      {showAverage && categories.length > 0 && (
        <div
          className="srx-group-average"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            paddingTop: 8,
            borderTop: `1px solid ${dividerColor}`,
            marginTop: 4,
          }}
        >
          <span
            style={{
              width: labelWidth,
              flexShrink: 0,
              fontSize: size * 0.44,
              fontWeight: 700,
              color: "inherit",
              ...averageLabelStyle,
            }}
          >
            {overallLabel}
          </span>
          <StarRating
            value={+average.toFixed(averagePrecision === 0.5 ? 1 : 0)}
            precision={averagePrecision}
            size={size}
            gap={gap}
            theme={theme}
            readOnly
            showValue
          />
        </div>
      )}
    </div>
  );
});

export default RatingGroup;
