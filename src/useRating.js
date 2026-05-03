import { useState, useCallback } from "react";

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
export function useRating({
  initialValue = 0,
  count = 5,
  precision = 1,
  onChange,
} = {}) {
  const [value, setValue] = useState(initialValue);
  const [hoverValue, setHoverValue] = useState(null);

  const set = useCallback(
    (next) => {
      const clamped = Math.max(0, Math.min(count, next));
      setValue(clamped);
      onChange?.(clamped);
    },
    [count, onChange]
  );

  const reset = useCallback(() => set(0), [set]);

  const handlers = {
    onChange: set,
    onHoverChange: setHoverValue,
  };

  return { value, hoverValue, set, reset, handlers };
}
