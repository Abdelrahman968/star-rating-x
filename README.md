# ⭐ star-rating-x

> The most complete React rating library.
> 10 Components · 5 Hooks · TypeScript · RTL · Zero dependencies.

[![npm version](https://img.shields.io/npm/v/star-rating-x)](https://www.npmjs.com/package/star-rating-x)
[![npm downloads](https://img.shields.io/npm/dm/star-rating-x)](https://www.npmjs.com/package/star-rating-x)
[![license](https://img.shields.io/npm/l/star-rating-x)](LICENSE)
[![types](https://img.shields.io/npm/types/star-rating-x)](https://www.npmjs.com/package/star-rating-x)

**[Live Demo](https://star-rating-x-demo.vercel.app)** · **[npm](https://www.npmjs.com/package/star-rating-x)** · **[GitHub](https://github.com/Abdelrahman968/star-rating-x)**

---

## What's inside

|                | Name                   | Description                             |
| -------------- | ---------------------- | --------------------------------------- |
| **Components** | `StarRating`           | Core interactive star rating            |
|                | `StarRatingInput`      | Form-ready wrapper — RHF · Formik · Zod |
|                | `StarRatingTooltip`    | Stars with rich popup tooltip on hover  |
|                | `RatingGroup`          | Rate multiple categories at once        |
|                | `RatingDistribution`   | Amazon-style bar chart breakdown        |
|                | `RatingSummary`        | Full review summary card                |
|                | `RatingWall`           | Masonry grid of review cards            |
|                | `RatingBadge`          | Compact inline ⭐ 4.8 (1.2k) badge      |
|                | `RatingPrompt`         | Smart timed/scroll/manual rating prompt |
| **Hooks**      | `useRating`            | Manage rating state externally          |
|                | `useRatingField`       | Standalone validation — required · min  |
|                | `useRatingAnalytics`   | Average · NPS · trend · distribution    |
|                | `useRatingPersistence` | Auto-save to localStorage with TTL      |
|                | `useRatingExport`      | Export ratings as CSV or JSON           |

---

## Installation

```bash
npm install star-rating-x
# or
yarn add star-rating-x
```

Import the CSS **once** at the top of your app:

```js
import "star-rating-x/styles.css";
```

---

## Next.js setup

### App Router (Next.js 13+)

```tsx
// app/layout.tsx
import "star-rating-x/styles.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

```tsx
// app/components/ProductRating.tsx
"use client"; // ← required — StarRating uses state & browser events

import { StarRating } from "star-rating-x";

export default function ProductRating() {
  const [rating, setRating] = useState(0);
  return <StarRating value={rating} onChange={setRating} />;
}
```

### Pages Router (Next.js 12 and below)

```tsx
// pages/_app.tsx
import "star-rating-x/styles.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
```

---

## Quick Start

```jsx
import { StarRating } from "star-rating-x";
import "star-rating-x/styles.css";

function App() {
  const [rating, setRating] = useState(0);
  return <StarRating value={rating} onChange={setRating} />;
}
```

---

## StarRating — Props

| Prop                | Type               | Default        | Description                                  |
| ------------------- | ------------------ | -------------- | -------------------------------------------- |
| `value`             | `number`           | —              | Controlled value (0–count)                   |
| `defaultValue`      | `number`           | `0`            | Uncontrolled initial value                   |
| `count`             | `number`           | `5`            | Total number of stars                        |
| `precision`         | `1 \| 0.5`         | `1`            | Whole or half-star                           |
| `size`              | `number \| string` | `32`           | Star size in px                              |
| `gap`               | `number`           | `6`            | Gap between stars in px                      |
| `shape`             | `StarShape`        | `"star"`       | Built-in icon shape                          |
| `theme`             | `ThemeName`        | `"gold"`       | Colour theme                                 |
| `filledColor`       | `string`           | —              | Override filled colour                       |
| `emptyColor`        | `string`           | —              | Override empty colour                        |
| `strokeColor`       | `string`           | —              | Override stroke colour                       |
| `strokeWidth`       | `number`           | `1.5`          | SVG stroke width                             |
| `character`         | `string \| fn`     | —              | Emoji, text, or render fn                    |
| `customIcon`        | `string \| fn`     | —              | Custom SVG path or render fn                 |
| `filledGradient`    | `string[]`         | —              | Multi-stop gradient fill                     |
| `gradientDirection` | `string`           | `"horizontal"` | `"horizontal"` / `"vertical"` / `"diagonal"` |
| `compareValue`      | `number`           | —              | Ghost rating shown behind main stars         |
| `compareLabel`      | `string`           | `"avg"`        | Label next to compareValue                   |
| `mountAnimation`    | `boolean`          | `false`        | Count-up on first render                     |
| `mountDuration`     | `number`           | `800`          | Mount animation duration ms                  |
| `celebrateOnMax`    | `boolean`          | `false`        | Confetti burst at max rating                 |
| `confettiColors`    | `string[]`         | —              | Confetti particle colours                    |
| `glowEffect`        | `boolean`          | `false`        | Glow around filled stars                     |
| `glowIntensity`     | `number`           | `0.5`          | Glow strength 0–1                            |
| `loading`           | `boolean`          | `false`        | Skeleton shimmer placeholder                 |
| `allowUndo`         | `boolean`          | `false`        | Undo toast after each change                 |
| `undoTimeout`       | `number`           | `4000`         | Undo window duration ms                      |
| `onUndo`            | `fn(prev)`         | —              | Called when user undoes                      |
| `onRatingComplete`  | `fn(v)`            | —              | Fires after user finishes (debounced)        |
| `debounceMs`        | `number`           | `0`            | Debounce delay for onRatingComplete          |
| `readOnly`          | `boolean`          | `false`        | Disable interaction, keep styling            |
| `disabled`          | `boolean`          | `false`        | Disable + grey out                           |
| `allowClear`        | `boolean`          | `true`         | Re-click current value to reset to 0         |
| `showValue`         | `boolean`          | `false`        | Show numeric label                           |
| `tooltips`          | `string[]`         | —              | Custom tooltip per star                      |
| `animation`         | `AnimationType`    | `"bounce"`     | Click animation                              |
| `direction`         | `"ltr" \| "rtl"`   | `"ltr"`        | Layout direction                             |
| `highlightSelected` | `boolean`          | `false`        | Ring on selected star                        |
| `label`             | `string`           | `"Rating"`     | ARIA label                                   |
| `onChange`          | `fn(v)`            | —              | Value change callback                        |
| `onHoverChange`     | `fn(v\|null)`      | —              | Hover change callback                        |

---

## Themes

`"gold"` · `"fire"` · `"ocean"` · `"neon"` · `"rose"` · `"mono"` · `"violet"` · `"sunset"` · `"mint"`

```jsx
<StarRating theme="fire"   />
<StarRating theme="ocean"  />
<StarRating theme="violet" />

// Override colours directly:
<StarRating filledColor="#FF6B6B" emptyColor="#FFE0E0" strokeColor="#CC0000" />

// Multi-stop gradient fill:
<StarRating filledGradient={["#FBBF24", "#F97316", "#EF4444"]} />
<StarRating filledGradient={["#38BDF8", "#6366F1"]} gradientDirection="diagonal" />
```

---

## Shapes

`"star"` · `"heart"` · `"circle"` · `"diamond"` · `"thumb"` · `"flag"` · `"lightning"` · `"flower"`

```jsx
<StarRating shape="heart"     theme="rose"   />
<StarRating shape="lightning" theme="neon"   />
<StarRating shape="diamond"   theme="violet" />
```

---

## Animations

`"bounce"` (default) · `"pulse"` · `"wiggle"` · `"pop"` · `"none"`

```jsx
<StarRating animation="wiggle" />
```

---

## Half-star Precision

```jsx
<StarRating precision={0.5} defaultValue={3.5} />
```

---

## Character / Emoji Mode

```jsx
// Same emoji for every star
<StarRating character="😊" count={5} />

// Different emoji per position via render fn
const emojis = ["😡", "😕", "😐", "😊", "🤩"];
<StarRating character={({ index, fill }) => fill > 0 ? emojis[index] : "⬜"} />

// Any text or symbol
<StarRating character="✦" theme="violet" />
```

---

## Custom SVG Icon

```jsx
// SVG path string (viewBox 0 0 24 24)
<StarRating customIcon="M12 2C8 2 4 6 4 10c0 5 8 12 8 12s8-7 8-12c0-4-4-8-8-8z" />

// Full render function
<StarRating
  customIcon={({ fill, fillColor, size }) => (
    <svg viewBox="0 0 24 24" width={size} height={size}>
      <circle cx="12" cy="12" r="10" fill={fillColor} />
    </svg>
  )}
/>
```

---

## Compare Mode

```jsx
<StarRating
  value={myRating}
  onChange={setMyRating}
  compareValue={4.2}
  compareLabel="community avg"
  showValue
/>
```

---

## Mount Animation

```jsx
<StarRating value={4} mountAnimation mountDuration={800} readOnly showValue />

// Replay by changing the key:
<StarRating key={replayKey} value={4} mountAnimation readOnly />
```

---

## Glow Effect

```jsx
<StarRating glowEffect glowIntensity={0.6} theme="gold" />
```

---

## Skeleton Loading

```jsx
<StarRating loading={isLoading} value={rating} />
```

---

## Undo Last Rating

```jsx
<StarRating
  value={rating}
  onChange={setRating}
  allowUndo
  undoTimeout={5000}
  onUndo={(prev) => console.log("Reverted to", prev)}
/>
```

---

## onRatingComplete + Debounce

```jsx
// Fires only after user stops changing — perfect for API calls
<StarRating onRatingComplete={(value) => submitToAPI(value)} debounceMs={800} />
```

---

## Confetti on Max Rating

```jsx
<StarRating
  celebrateOnMax
  confettiColors={["#FBBF24", "#F97316", "#EC4899", "#8B5CF6"]}
/>
```

---

## RTL Support

```jsx
<StarRating direction="rtl" />
```

---

## Read-only Display

```jsx
<StarRating value={4.5} precision={0.5} readOnly showValue />
```

---

## StarRatingInput — Form Field

```jsx
import { StarRatingInput } from "star-rating-x";

<StarRatingInput
  label="Rate your experience"
  helperText="Your feedback helps us improve"
  required
  errorMessage={errors.rating?.message}
/>;
```

### React Hook Form + Zod

```tsx
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { StarRatingInput } from "star-rating-x";

const schema = z.object({
  rating: z.number().min(1, "Please select at least 1 star"),
});

const { control } = useForm({ resolver: zodResolver(schema) });

<Controller
  name="rating"
  control={control}
  render={({ field, fieldState }) => (
    <StarRatingInput
      {...field}
      label="Product rating"
      required
      errorMessage={fieldState.error?.message}
    />
  )}
/>;
```

---

## StarRatingTooltip

```jsx
import { StarRatingTooltip } from "star-rating-x";

<StarRatingTooltip
  tooltips={["Terrible 😡", "Bad 😕", "Okay 😐", "Good 😊", "Amazing! 🤩"]}
  tooltipRenderer={({ value, label }) => (
    <span>
      <strong>{value}★</strong> — {label}
    </span>
  )}
  tooltipPlacement="top"
/>;
```

---

## RatingGroup

```jsx
import { RatingGroup } from "star-rating-x";

<RatingGroup
  categories={[
    { key: "quality", label: "Food Quality" },
    { key: "service", label: "Service" },
    { key: "value", label: "Value" },
  ]}
  values={ratings}
  onChange={(key, val, allValues) => setRatings(allValues)}
  showAverage
  overallLabel="Total Score"
  dividerColor="#334155"
  showValues
  theme="gold"
/>;
```

| Prop                | Type                    | Default     | Description                  |
| ------------------- | ----------------------- | ----------- | ---------------------------- |
| `categories`        | `{key,label}[]`         | required    | Categories to rate           |
| `values`            | `Record<string,number>` | —           | Controlled values            |
| `defaultValues`     | `Record<string,number>` | `{}`        | Uncontrolled initial values  |
| `onChange`          | `fn(key,val,all)`       | —           | Change callback              |
| `showAverage`       | `boolean`               | `false`     | Show overall average row     |
| `overallLabel`      | `string`                | `"Overall"` | Average row label text       |
| `averagePrecision`  | `1\|0.5`                | `0.5`       | Average row precision        |
| `showValues`        | `boolean`               | `false`     | Show numeric value per row   |
| `labelWidth`        | `number`                | `120`       | Label column width px        |
| `rowGap`            | `number`                | `12`        | Gap between rows px          |
| `dividerColor`      | `string`                | `"#e5e7eb"` | Divider colour above average |
| `averageLabelStyle` | `CSSProperties`         | —           | Style for overall label      |

---

## RatingDistribution

```jsx
import { RatingDistribution } from "star-rating-x";

<RatingDistribution
  data={{ 5: 842, 4: 321, 3: 98, 2: 34, 1: 22 }}
  theme="gold"
  showCount
  onFilter={(star) => setFilter(star)}
  activeFilter={filter}
/>;
```

---

## RatingSummary

```jsx
import { RatingSummary } from "star-rating-x";

<RatingSummary
  average={4.3}
  total={1317}
  distribution={{ 5: 842, 4: 321, 3: 98, 2: 34, 1: 22 }}
  reviews={recentReviews}
  showReviews
  maxReviews={3}
  onWriteReview={() => openModal()}
  theme="gold"
/>;
```

---

## RatingWall

```jsx
import { RatingWall } from "star-rating-x";

<RatingWall
  reviews={reviews}
  columns={3}
  maxItems={9}
  showMore
  sortBy="highest"
  onHelpful={(r) => markHelpful(r.id)}
  theme="gold"
/>;
```

Review object shape:

```ts
{
  id?: string | number;
  author?: string;
  avatar?: string;
  rating: number;
  title?: string;
  text?: string;
  date?: string;
  verified?: boolean;
  helpful?: number;
}
```

---

## RatingBadge

```jsx
import { RatingBadge } from "star-rating-x";

// Sizes: "xs" | "sm" | "md" | "lg"
<RatingBadge value={4.8} count={1247} theme="gold" size="md" />
<RatingBadge value={4.1} compact theme="ocean" size="sm" />
```

---

## RatingPrompt

```jsx
import { RatingPrompt } from "star-rating-x";

// Show after 5 seconds
<RatingPrompt
  trigger="time"
  delay={5000}
  message="Enjoying the app?"
  onRate={(value) => submitRating(value)}
  onDismiss={() => setShow(false)}
  placement="bottom-right"
  theme="gold"
/>

// Show after 60% scroll
<RatingPrompt trigger="scroll" scrollPercent={60} onRate={fn} onDismiss={fn} />

// Manual
<RatingPrompt trigger="action" visible={show} onRate={fn} onDismiss={fn} />
```

---

## useRating

```jsx
const { value, handlers, reset } = useRating({ initialValue: 3 });
<StarRating value={value} {...handlers} />;
```

---

## useRatingField

```jsx
const rating = useRatingField({ required: true, minValue: 1 });

<StarRatingInput
  {...rating.field}
  label="Your rating"
  required
  errorMessage={rating.errorMessage}
/>;
```

| Return         | Description                                     |
| -------------- | ----------------------------------------------- |
| `field`        | `{value, onChange, onBlur}` — spread onto input |
| `handlers`     | `{value, onChange}` — spread onto StarRating    |
| `error`        | Validation error string or null                 |
| `touched`      | Has user interacted                             |
| `isDirty`      | Value changed from initial                      |
| `isValid`      | No errors                                       |
| `showError`    | `touched && !!error`                            |
| `errorMessage` | Error when touched, else null                   |
| `reset`        | Restore initial state                           |

---

## useRatingAnalytics

```jsx
const stats = useRatingAnalytics([5, 4, 5, 3, 5, 4, 2, 5]);

// stats.average         → 4.1
// stats.nps             → 62
// stats.trend           → "improving"
// stats.percentPositive → 75%
// stats.distribution    → { 5:4, 4:2, 3:1, 2:1, 1:0 }
```

---

## useRatingPersistence

```jsx
const { value, onChange } = useRatingPersistence(`product-${id}`, {
  defaultValue: 0,
  ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
});

<StarRating value={value} onChange={onChange} />;
```

---

## useRatingExport

```jsx
const { exportCSV, exportJSON, copyJSON } = useRatingExport(ratingsData, {
  filename: "reviews",
  csvFields: ["id", "author", "rating", "date"],
});

<button onClick={exportCSV}>Download CSV</button>
<button onClick={exportJSON}>Download JSON</button>
```

---

## TypeScript

Full `.d.ts` declarations ship with the package.

```ts
import type {
  StarRatingProps,
  StarRatingInputProps,
  StarRatingTooltipProps,
  RatingGroupProps,
  RatingDistributionProps,
  RatingSummaryProps,
  RatingWallProps,
  RatingBadgeProps,
  RatingPromptProps,
  ReviewItem,
  RatingCategory,
  StarShape,
  ThemeName,
  AnimationType,
  BadgeSize,
  PromptTrigger,
  PromptPlacement,
  AnalyticsResult,
  IconRenderContext,
  CharacterRenderContext,
  UseRatingResult,
  UseRatingFieldResult,
  UseRatingPersistenceResult,
  UseRatingExportResult,
} from "star-rating-x";
```

---

## Accessibility

- `role="slider"` with `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `aria-valuetext`
- Full keyboard navigation — `←` `→` `↑` `↓` `Home` `End`
- `aria-label` per star (or custom `tooltips`)
- `aria-required` + `aria-invalid` on `StarRatingInput`
- `aria-live="polite"` on undo toast
- Focus-visible ring
- Respects `prefers-reduced-motion`

---

## Changelog

### v5.0.0

- ✨ `RatingBadge` — compact inline badge
- ✨ `RatingSummary` — full Amazon-style review summary card
- ✨ `RatingWall` — masonry grid of review cards
- ✨ `RatingPrompt` — smart timed / scroll / manual rating prompt
- ✨ `useRatingAnalytics` — average, NPS, trend, distribution
- ✨ `useRatingPersistence` — localStorage with TTL
- ✨ `useRatingExport` — CSV / JSON export
- ✨ `glowEffect` + `glowIntensity` props
- ✨ `loading` skeleton shimmer prop
- ✨ `allowUndo` + `undoTimeout` + `onUndo` props
- ✨ `onRatingComplete` + `debounceMs` props

### v4.0.0

- ✨ `filledGradient` + `gradientDirection` — multi-stop gradient fill
- ✨ `compareValue` + `compareLabel` — ghost comparison rating
- ✨ `celebrateOnMax` + `confettiColors` — confetti burst at max
- ✨ `RatingGroup` — `overallLabel`, `dividerColor`, `averageLabelStyle`, `rowGap`

### v3.0.0

- ✨ `StarRatingInput` — form-ready field (RHF · Formik · Zod)
- ✨ `StarRatingTooltip` — rich popup tooltip component
- ✨ `RatingDistribution` — Amazon-style bar chart
- ✨ `RatingGroup` multi-category component
- ✨ `useRatingField` — standalone validation hook

### v2.0.0

- ✨ `character` prop — emoji, text, or render function
- ✨ `customIcon` prop — custom SVG path or render function
- ✨ `mountAnimation` + `mountDuration` — count-up on render

### v1.0.1

- 📦 npm metadata — homepage, bugs, funding, author URL

### v1.0.0

- 🎉 Initial release — 9 themes, 8 shapes, 4 animations, half-star, RTL, keyboard nav, `useRating`

---

## License

MIT © [Abdelrahman Ayman](https://linkedin.com/in/abdelrahman968)
