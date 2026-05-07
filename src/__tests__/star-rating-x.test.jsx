/**
 * star-rating-x — Test Suite
 * Run: npx vitest run
 *
 * Setup needed (add to devDependencies):
 *   vitest @testing-library/react @testing-library/user-event
 *   @testing-library/jest-dom jsdom
 *
 * vitest.config.ts:
 *   export default { test: { environment: "jsdom", setupFiles: ["./vitest.setup.ts"] } }
 *
 * vitest.setup.ts:
 *   import "@testing-library/jest-dom";
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderHook, act } from "@testing-library/react";

// ─── Adjust these import paths to match your project ─────────────────────────
import StarRating          from "./src/StarRating.jsx";
import StarRatingInput     from "./src/StarRatingInput.jsx";
import RatingGroup         from "./src/RatingGroup.jsx";
import RatingDistribution  from "./src/RatingDistribution.jsx";
import { useRating }       from "./src/useRating.js";
import { useRatingField }  from "./src/useRatingField.js";

// ─────────────────────────────────────────────────────────────────────────────
// StarRating — core behaviour
// ─────────────────────────────────────────────────────────────────────────────

describe("StarRating — rendering", () => {
  it("renders the correct number of stars", () => {
    render(<StarRating count={5} />);
    const stars = screen.getAllByRole("presentation", { hidden: true });
    // each star is a <span> — check aria-label tooltips
    expect(screen.getByLabelText("1 star")).toBeInTheDocument();
    expect(screen.getByLabelText("5 stars")).toBeInTheDocument();
  });

  it("applies correct role and ARIA attributes", () => {
    render(<StarRating value={3} count={5} label="Product rating" />);
    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("aria-label", "Product rating");
    expect(slider).toHaveAttribute("aria-valuemin", "0");
    expect(slider).toHaveAttribute("aria-valuemax", "5");
    expect(slider).toHaveAttribute("aria-valuenow", "3");
    expect(slider).toHaveAttribute("aria-valuetext", "3 out of 5");
  });

  it("renders custom count", () => {
    render(<StarRating count={10} />);
    expect(screen.getByLabelText("10 stars")).toBeInTheDocument();
  });

  it("shows numeric value when showValue=true", () => {
    const { container } = render(<StarRating value={4} showValue />);
    expect(container.textContent).toContain("4");
  });
});

describe("StarRating — controlled mode", () => {
  it("calls onChange with correct value on click", async () => {
    const onChange = vi.fn();
    render(<StarRating value={2} onChange={onChange} count={5} />);
    await userEvent.click(screen.getByLabelText("4 stars"));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it("resets to 0 on re-click of current value (allowClear=true)", async () => {
    const onChange = vi.fn();
    render(<StarRating value={3} onChange={onChange} allowClear />);
    await userEvent.click(screen.getByLabelText("3 stars"));
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it("does NOT reset when allowClear=false", async () => {
    const onChange = vi.fn();
    render(<StarRating value={3} onChange={onChange} allowClear={false} />);
    await userEvent.click(screen.getByLabelText("3 stars"));
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it("does not fire onChange when readOnly", async () => {
    const onChange = vi.fn();
    render(<StarRating value={3} onChange={onChange} readOnly />);
    await userEvent.click(screen.getByLabelText("4 stars"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("does not fire onChange when disabled", async () => {
    const onChange = vi.fn();
    render(<StarRating value={3} onChange={onChange} disabled />);
    await userEvent.click(screen.getByLabelText("4 stars"));
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("StarRating — uncontrolled mode", () => {
  it("starts at defaultValue", () => {
    render(<StarRating defaultValue={2} />);
    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("aria-valuenow", "2");
  });

  it("updates internally on click", async () => {
    render(<StarRating defaultValue={1} />);
    await userEvent.click(screen.getByLabelText("4 stars"));
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "4");
  });
});

describe("StarRating — keyboard navigation", () => {
  it("increments with ArrowRight", async () => {
    const onChange = vi.fn();
    render(<StarRating value={2} onChange={onChange} />);
    const slider = screen.getByRole("slider");
    slider.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it("decrements with ArrowLeft", async () => {
    const onChange = vi.fn();
    render(<StarRating value={4} onChange={onChange} />);
    screen.getByRole("slider").focus();
    await userEvent.keyboard("{ArrowLeft}");
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it("jumps to max with End key", async () => {
    const onChange = vi.fn();
    render(<StarRating value={2} count={5} onChange={onChange} />);
    screen.getByRole("slider").focus();
    await userEvent.keyboard("{End}");
    expect(onChange).toHaveBeenCalledWith(5);
  });

  it("jumps to 0 with Home key", async () => {
    const onChange = vi.fn();
    render(<StarRating value={3} onChange={onChange} />);
    screen.getByRole("slider").focus();
    await userEvent.keyboard("{Home}");
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it("does not go below 0", async () => {
    const onChange = vi.fn();
    render(<StarRating value={0} onChange={onChange} />);
    screen.getByRole("slider").focus();
    await userEvent.keyboard("{ArrowLeft}");
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it("does not go above count", async () => {
    const onChange = vi.fn();
    render(<StarRating value={5} count={5} onChange={onChange} />);
    screen.getByRole("slider").focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenCalledWith(5);
  });

  it("increments by 0.5 when precision=0.5", async () => {
    const onChange = vi.fn();
    render(<StarRating value={2} precision={0.5} onChange={onChange} />);
    screen.getByRole("slider").focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenCalledWith(2.5);
  });
});

describe("StarRating — hover", () => {
  it("calls onHoverChange on mouse enter/leave", () => {
    const onHoverChange = vi.fn();
    render(<StarRating onHoverChange={onHoverChange} />);
    fireEvent.mouseMove(screen.getByLabelText("3 stars"), { clientX: 0 });
    expect(onHoverChange).toHaveBeenCalled();
    fireEvent.mouseLeave(screen.getByRole("slider"));
    expect(onHoverChange).toHaveBeenCalledWith(null);
  });
});

describe("StarRating — custom tooltips", () => {
  it("uses custom tooltip text", () => {
    render(
      <StarRating tooltips={["Terrible", "Bad", "Okay", "Good", "Amazing"]} />
    );
    expect(screen.getByTitle("Amazing")).toBeInTheDocument();
    expect(screen.getByTitle("Terrible")).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// StarRatingInput
// ─────────────────────────────────────────────────────────────────────────────

describe("StarRatingInput — form field", () => {
  it("renders label", () => {
    render(<StarRatingInput label="Rate us" />);
    expect(screen.getByText("Rate us")).toBeInTheDocument();
  });

  it("renders required indicator", () => {
    render(<StarRatingInput label="Rate us" required />);
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("shows error message", () => {
    render(<StarRatingInput errorMessage="Please select a rating" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Please select a rating");
  });

  it("shows helper text when no error", () => {
    render(<StarRatingInput helperText="Optional feedback" />);
    expect(screen.getByText("Optional feedback")).toBeInTheDocument();
  });

  it("hides helper text when error is shown", () => {
    render(
      <StarRatingInput helperText="Optional" errorMessage="Required!" />
    );
    expect(screen.queryByText("Optional")).not.toBeInTheDocument();
    expect(screen.getByText("Required!")).toBeInTheDocument();
  });

  it("renders hidden input with correct value", () => {
    const { container } = render(
      <StarRatingInput name="product_rating" value={3} />
    );
    const hidden = container.querySelector("input[type='hidden']");
    expect(hidden).toHaveAttribute("name", "product_rating");
    expect(hidden).toHaveAttribute("value", "3");
  });

  it("calls onChange when star is clicked", async () => {
    const onChange = vi.fn();
    render(<StarRatingInput value={0} onChange={onChange} />);
    await userEvent.click(screen.getByLabelText("3 stars"));
    expect(onChange).toHaveBeenCalledWith(3);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// RatingGroup
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { key: "quality",  label: "Quality"  },
  { key: "service",  label: "Service"  },
  { key: "value",    label: "Value"    },
];

describe("RatingGroup", () => {
  it("renders all category labels", () => {
    render(<RatingGroup categories={CATEGORIES} />);
    expect(screen.getByText("Quality")).toBeInTheDocument();
    expect(screen.getByText("Service")).toBeInTheDocument();
    expect(screen.getByText("Value")).toBeInTheDocument();
  });

  it("renders overall row when showAverage=true", () => {
    render(
      <RatingGroup
        categories={CATEGORIES}
        defaultValues={{ quality: 4, service: 3, value: 5 }}
        showAverage
      />
    );
    expect(screen.getByText("Overall")).toBeInTheDocument();
  });

  it("calls onChange with key, value, and allValues", async () => {
    const onChange = vi.fn();
    render(
      <RatingGroup
        categories={CATEGORIES}
        values={{ quality: 0, service: 0, value: 0 }}
        onChange={onChange}
      />
    );
    // click the 4th star in the first row (Quality)
    const allSliders = screen.getAllByRole("slider");
    allSliders[0].focus();
    await userEvent.keyboard("{End}");
    expect(onChange).toHaveBeenCalledWith(
      "quality",
      5,
      expect.objectContaining({ quality: 5 })
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// RatingDistribution
// ─────────────────────────────────────────────────────────────────────────────

const DIST_DATA = { 5: 100, 4: 50, 3: 25, 2: 10, 1: 5 };

describe("RatingDistribution", () => {
  it("renders all star levels", () => {
    render(<RatingDistribution data={DIST_DATA} />);
    // labels 5 down to 1
    [5, 4, 3, 2, 1].forEach((n) => {
      expect(screen.getAllByTitle(new RegExp(`${n} star`)).length).toBeGreaterThan(0);
    });
  });

  it("shows counts by default", () => {
    render(<RatingDistribution data={DIST_DATA} showCount />);
    expect(screen.getByText("100")).toBeInTheDocument();
  });

  it("calls onFilter with star number on click", async () => {
    const onFilter = vi.fn();
    render(<RatingDistribution data={DIST_DATA} onFilter={onFilter} />);
    // click the row titled "5 stars" (or similar)
    const row = screen.getByTitle(/5 star/);
    await userEvent.click(row);
    expect(onFilter).toHaveBeenCalledWith(5);
  });

  it("calls onFilter with null when clicking active filter", async () => {
    const onFilter = vi.fn();
    render(
      <RatingDistribution data={DIST_DATA} onFilter={onFilter} activeFilter={5} />
    );
    await userEvent.click(screen.getByTitle(/5 star/));
    expect(onFilter).toHaveBeenCalledWith(null);
  });

  it("shows average when data provided", () => {
    // avg = (5*100 + 4*50 + 3*25 + 2*10 + 1*5) / 190 ≈ 4.3
    const { container } = render(<RatingDistribution data={DIST_DATA} />);
    expect(container.textContent).toMatch(/4\.[0-9]/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// useRating hook
// ─────────────────────────────────────────────────────────────────────────────

describe("useRating", () => {
  it("initialises with defaultValue", () => {
    const { result } = renderHook(() => useRating({ initialValue: 3 }));
    expect(result.current.value).toBe(3);
  });

  it("updates value via set()", () => {
    const { result } = renderHook(() => useRating({ initialValue: 0 }));
    act(() => result.current.set(4));
    expect(result.current.value).toBe(4);
  });

  it("resets via reset()", () => {
    const { result } = renderHook(() => useRating({ initialValue: 2 }));
    act(() => { result.current.set(5); result.current.reset(); });
    expect(result.current.value).toBe(0);
  });

  it("clamps set() to count", () => {
    const { result } = renderHook(() => useRating({ initialValue: 0, count: 5 }));
    act(() => result.current.set(99));
    expect(result.current.value).toBe(5);
  });

  it("clamps set() to 0 minimum", () => {
    const { result } = renderHook(() => useRating({ initialValue: 3 }));
    act(() => result.current.set(-5));
    expect(result.current.value).toBe(0);
  });

  it("calls external onChange", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useRating({ onChange }));
    act(() => result.current.set(3));
    expect(onChange).toHaveBeenCalledWith(3);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// useRatingField hook
// ─────────────────────────────────────────────────────────────────────────────

describe("useRatingField — validation", () => {
  it("starts untouched with no error shown", () => {
    const { result } = renderHook(() =>
      useRatingField({ required: true })
    );
    expect(result.current.touched).toBe(false);
    expect(result.current.showError).toBe(false);
    expect(result.current.errorMessage).toBeNull();
  });

  it("shows error after touch when required and value=0", () => {
    const { result } = renderHook(() =>
      useRatingField({ required: true })
    );
    act(() => result.current.field.onBlur());
    expect(result.current.showError).toBe(true);
    expect(result.current.error).toBe("A rating is required.");
  });

  it("clears error after valid value selected", () => {
    const { result } = renderHook(() =>
      useRatingField({ required: true })
    );
    act(() => { result.current.field.onBlur(); result.current.field.onChange(4); });
    expect(result.current.showError).toBe(false);
    expect(result.current.isValid).toBe(true);
  });

  it("enforces minValue", () => {
    const { result } = renderHook(() =>
      useRatingField({ required: true, minValue: 3, minMessage: "Need 3+ stars." })
    );
    act(() => { result.current.field.onChange(2); result.current.field.onBlur(); });
    expect(result.current.errorMessage).toBe("Need 3+ stars.");
  });

  it("passes custom validator", () => {
    const { result } = renderHook(() =>
      useRatingField({
        validate: (v) => (v === 3 ? "3 stars is forbidden!" : null),
      })
    );
    act(() => { result.current.field.onChange(3); result.current.field.onBlur(); });
    expect(result.current.errorMessage).toBe("3 stars is forbidden!");
  });

  it("reset() restores initial state", () => {
    const { result } = renderHook(() =>
      useRatingField({ initialValue: 2, required: true })
    );
    act(() => { result.current.field.onChange(5); result.current.reset(); });
    expect(result.current.value).toBe(2);
    expect(result.current.touched).toBe(false);
    expect(result.current.isDirty).toBe(false);
  });

  it("isDirty is true after change", () => {
    const { result } = renderHook(() => useRatingField({ initialValue: 0 }));
    act(() => result.current.field.onChange(3));
    expect(result.current.isDirty).toBe(true);
  });

  it("field spread works correctly", () => {
    const { result } = renderHook(() => useRatingField({ initialValue: 1 }));
    expect(result.current.field).toHaveProperty("value");
    expect(result.current.field).toHaveProperty("onChange");
    expect(result.current.field).toHaveProperty("onBlur");
  });
});
