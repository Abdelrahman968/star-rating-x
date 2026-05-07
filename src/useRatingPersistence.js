import { useState, useCallback, useEffect } from "react";

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
export function useRatingPersistence(key, {
  defaultValue = 0,
  ttl,
  namespace = "srx:",
  onLoad,
  onChange: externalOnChange,
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
      value:    stored?.value ?? defaultValue,
      storedAt: stored?.storedAt ?? null,
      isLoaded: stored !== null,
    };
  });

  // notify onLoad after mount
  useEffect(() => {
    if (state.isLoaded) onLoad?.(state.value);
  }, []); // eslint-disable-line

  const handleChange = useCallback(
    (val) => {
      const storedAt = Date.now();
      try {
        localStorage.setItem(storageKey, JSON.stringify({ value: val, storedAt }));
      } catch {
        // storage might be full — fail silently
      }
      setState({ value: val, storedAt, isLoaded: true });
      externalOnChange?.(val);
    },
    [storageKey, externalOnChange]
  );

  const reset = useCallback(() => {
    try { localStorage.removeItem(storageKey); } catch { /* */ }
    setState({ value: defaultValue, storedAt: null, isLoaded: false });
    externalOnChange?.(defaultValue);
  }, [storageKey, defaultValue, externalOnChange]);

  return {
    value:    state.value,
    onChange: handleChange,
    reset,
    isLoaded: state.isLoaded,
    storedAt: state.storedAt,
  };
}
