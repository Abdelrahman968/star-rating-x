import React, { forwardRef, useId } from "react";
import StarRating from "./StarRating.jsx";

/**
 * StarRatingInput — a form-ready wrapper around StarRating.
 *
 * Works out-of-the-box with:
 *   • React Hook Form  (via Controller or register)
 *   • Formik           (via Field or useField)
 *   • HTML forms       (outputs a hidden <input> with the numeric value)
 *
 * Extra props on top of StarRatingProps:
 *  name          {string}   Field name (used for hidden input + aria)
 *  label         {string}   Visible label above the stars
 *  required      {boolean}  Adds * to label and sets aria-required
 *  minValue      {number}   Minimum acceptable value (for custom validation)
 *  errorMessage  {string}   Error text shown below the stars
 *  helperText    {string}   Helper hint shown below the stars (hidden when error shown)
 *  labelStyle    {object}
 *  errorStyle    {object}
 *  helperStyle   {object}
 *  wrapperStyle  {object}
 *
 * React Hook Form example:
 *  <Controller
 *    name="rating"
 *    control={control}
 *    rules={{ required: "Rating is required", min: { value: 1, message: "Min 1 star" } }}
 *    render={({ field, fieldState }) => (
 *      <StarRatingInput
 *        {...field}
 *        label="Your rating"
 *        errorMessage={fieldState.error?.message}
 *        required
 *      />
 *    )}
 *  />
 */
const StarRatingInput = forwardRef(function StarRatingInput(
  {
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
  },
  _ref
) {
  const innerId = useId();
  const id = name ?? innerId;
  const hasError = !!errorMessage;

  const handleChange = (val) => {
    onChange?.(val);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        ...wrapperStyle,
      }}
    >
      {/* label */}
      {label && (
        <label
          htmlFor={id}
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: hasError ? "#ef4444" : "inherit",
            display: "flex",
            alignItems: "center",
            gap: 4,
            ...labelStyle,
          }}
        >
          {label}
          {required && (
            <span style={{ color: "#ef4444", fontWeight: 700 }} aria-hidden>
              *
            </span>
          )}
        </label>
      )}

      {/* stars */}
      <div
        id={id}
        role="group"
        aria-labelledby={label ? `${id}-label` : undefined}
        aria-required={required}
        aria-invalid={hasError}
        aria-describedby={
          hasError
            ? `${id}-error`
            : helperText
            ? `${id}-helper`
            : undefined
        }
        style={{
          display: "inline-flex",
          outline: hasError ? "2px solid #ef444440" : "none",
          borderRadius: 8,
          padding: hasError ? "4px 6px" : "0",
          transition: "outline 0.2s",
        }}
      >
        <StarRating
          value={value ?? 0}
          onChange={handleChange}
          {...starProps}
        />
      </div>

      {/* hidden input for native forms */}
      <input
        type="hidden"
        name={name}
        value={value ?? 0}
        aria-hidden
        readOnly
      />

      {/* error message */}
      {hasError && (
        <span
          id={`${id}-error`}
          role="alert"
          style={{
            fontSize: 12,
            color: "#ef4444",
            display: "flex",
            alignItems: "center",
            gap: 4,
            ...errorStyle,
          }}
        >
          <svg viewBox="0 0 24 24" width={13} height={13} aria-hidden>
            <circle cx="12" cy="12" r="10" fill="#ef4444" />
            <path d="M12 8v4M12 16h.01" stroke="#fff" strokeWidth={2} strokeLinecap="round" />
          </svg>
          {errorMessage}
        </span>
      )}

      {/* helper text */}
      {!hasError && helperText && (
        <span
          id={`${id}-helper`}
          style={{
            fontSize: 12,
            color: "#64748b",
            ...helperStyle,
          }}
        >
          {helperText}
        </span>
      )}
    </div>
  );
});

export default StarRatingInput;
