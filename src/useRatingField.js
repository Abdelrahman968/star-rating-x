import { useState, useCallback } from "react";

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
export function useRatingField({
  initialValue = 0,
  count = 5,
  precision = 1,
  minValue = 0,
  maxValue,
  required = false,
  requiredMessage = "A rating is required.",
  minMessage,
  validate: customValidate,
  onChange: externalOnChange,
} = {}) {
  const [value, setValue]   = useState(initialValue);
  const [touched, setTouched] = useState(false);

  const max = maxValue ?? count;

  const runValidation = useCallback(
    (val) => {
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
    },
    [required, requiredMessage, minValue, minMessage, customValidate]
  );

  const error   = runValidation(value);
  const isValid = error === null;
  const isDirty = value !== initialValue;

  const handleChange = useCallback(
    (val) => {
      const clamped = Math.max(0, Math.min(max, val));
      setValue(clamped);
      setTouched(true);
      externalOnChange?.(clamped);
    },
    [max, externalOnChange]
  );

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
    onBlur:   handleBlur,
  };

  /** handlers — spread onto StarRating (no onBlur) */
  const handlers = {
    value,
    onChange:      handleChange,
    onHoverChange: () => {},
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
    errorMessage: touched ? error : null,
  };
}
