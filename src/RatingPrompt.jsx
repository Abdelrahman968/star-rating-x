import React, { useState, useEffect, useCallback, forwardRef } from "react";
import StarRating from "./StarRating.jsx";
import { getThemeVars } from "./themes.js";

/**
 * RatingPrompt — smart prompt that asks the user to rate at the right moment.
 *
 * Triggers:
 *  "time"    — appears after `delay` ms
 *  "scroll"  — appears after user scrolls past `scrollPercent`% of the page
 *  "action"  — show/hide is controlled manually via `visible` prop
 *
 * Props:
 *  trigger         {'time'|'scroll'|'action'}
 *  delay           {number}   ms before showing (trigger='time', default 5000)
 *  scrollPercent   {number}   0-100 scroll depth (trigger='scroll', default 60)
 *  visible         {bool}     manual control (trigger='action')
 *  message         {string}   Prompt headline
 *  subMessage      {string}   Optional sub-text
 *  onRate          {fn(value)}
 *  onDismiss       {fn}
 *  onLater         {fn}       Called when user clicks "Maybe later"
 *  showLater       {bool}     Show "Maybe later" option (default true)
 *  laterLabel      {string}   (default "Maybe later")
 *  dismissLabel    {string}   (default "×")
 *  submitLabel     {string}   (default "Submit")
 *  placement       {'bottom-right'|'bottom-left'|'bottom-center'|'center'}
 *  theme           {string}
 *  count           {number}   Star count (default 5)
 *  size            {number}   Star size (default 32)
 *  animation       {string}
 *  rememberDismiss {bool}     Remember dismissal in localStorage (default true)
 *  storageKey      {string}   localStorage key for dismiss memory
 *  className       {string}
 *  style           {object}
 */
const RatingPrompt = forwardRef(function RatingPrompt(
  {
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
    style = {},
  },
  ref
) {
  const t = getThemeVars(theme);
  const color = t.filled;

  const [show, setShow]         = useState(false);
  const [rating, setRating]     = useState(0);
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
      const scrolled = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      if (scrolled >= scrollPercent) {
        setShow(true);
        window.removeEventListener("scroll", handler);
      }
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [trigger, scrollPercent, dismissed]);

  // trigger: action (controlled externally)
  useEffect(() => {
    if (trigger === "action") setShow(!!externalVisible);
  }, [trigger, externalVisible]);

  const handleDismiss = useCallback(() => {
    setShow(false);
    if (rememberDismiss) {
      try { localStorage.setItem(storageKey, "1"); } catch { /* */ }
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
    "bottom-right":  { bottom: 24, right: 24 },
    "bottom-left":   { bottom: 24, left: 24 },
    "bottom-center": { bottom: 24, left: "50%", transform: "translateX(-50%)" },
    "center":        { top: "50%", left: "50%", transform: "translate(-50%,-50%)" },
  };
  const pos = PLACEMENTS[placement] ?? PLACEMENTS["bottom-right"];

  return (
    <div
      ref={ref}
      className={`srx-prompt ${className}`}
      role="dialog"
      aria-label="Rating prompt"
      style={{
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
        ...style,
      }}
    >
      {/* dismiss X */}
      <button
        onClick={handleDismiss}
        aria-label="Dismiss"
        style={{
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
          lineHeight: 1,
        }}
      >
        {dismissLabel}
      </button>

      {submitted ? (
        /* thank you state */
        <div style={{ textAlign: "center", padding: "8px 0" }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🎉</div>
          <p style={{ margin: 0, fontWeight: 700, color: "#f1f5f9", fontSize: 15 }}>
            Thank you!
          </p>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 13 }}>
            Your rating has been submitted.
          </p>
        </div>
      ) : (
        <>
          {/* message */}
          <div style={{ paddingRight: 24 }}>
            <p style={{ margin: 0, fontWeight: 800, fontSize: 15, color: "#f1f5f9" }}>
              {message}
            </p>
            {subMessage && (
              <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>
                {subMessage}
              </p>
            )}
          </div>

          {/* stars */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <StarRating
              value={rating}
              onChange={setRating}
              count={count}
              size={size}
              theme={theme}
              animation={animation}
            />
          </div>

          {/* actions */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              onClick={handleSubmit}
              disabled={rating === 0}
              style={{
                flex: 1,
                padding: "9px 0",
                borderRadius: 10,
                background: rating > 0
                  ? `linear-gradient(135deg, ${color}, ${color}cc)`
                  : "#1e293b",
                border: "none",
                color: rating > 0 ? "#fff" : "#475569",
                fontWeight: 700,
                fontSize: 13,
                cursor: rating > 0 ? "pointer" : "not-allowed",
                transition: "all 0.2s",
              }}
            >
              {submitLabel}
            </button>
            {showLater && (
              <button
                onClick={handleLater}
                style={{
                  padding: "9px 14px",
                  borderRadius: 10,
                  background: "transparent",
                  border: "1px solid #1e293b",
                  color: "#64748b",
                  fontWeight: 600,
                  fontSize: 12,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {laterLabel}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
});

export default RatingPrompt;
