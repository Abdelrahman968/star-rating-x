# ⭐ star-rating-x

> A fully-featured, accessible, customisable React star-rating component.  
> Themes · Shapes · Animations · Half-star · RTL · Emoji/Characters · Custom SVG · Group Rating · TypeScript · Zero dependencies.

[![npm](https://img.shields.io/npm/v/star-rating-x)](https://www.npmjs.com/package/star-rating-x)
[![license](https://img.shields.io/npm/l/star-rating-x)](LICENSE)
[![types](https://img.shields.io/npm/types/star-rating-x)](https://www.npmjs.com/package/star-rating-x)

---

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Next.js Setup](#nextjs-setup)
- [Props](#props)
- [Shapes](#shapes)
- [Themes](#themes)
- [Animations](#animations)
- [Half-star Precision](#half-star-precision)
- [RTL Support](#rtl-support)
- [Read-only Display](#read-only-display)
- [v2 Features](#v2-features)
  - [character — Emoji & Text Mode](#character--emoji--text-mode)
  - [customIcon — Custom SVG](#customicon--custom-svg)
  - [mountAnimation — Count-up on Load](#mountanimation--count-up-on-load)
  - [RatingGroup — Multiple Categories](#ratinggroup--multiple-categories)
- [`useRating` Hook](#userating-hook)
- [Accessibility](#accessibility)
- [TypeScript](#typescript)
- [Changelog](#changelog)
- [License](#license)

---

## Installation

```bash
npm install star-rating-x
# or
yarn add star-rating-x
```

Import the CSS once (e.g. in your `_app.tsx` / `layout.tsx`):

```js
import "star-rating-x/styles.css";
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

## Next.js Setup

### App Router (Next.js 13+)

Import the stylesheet in your root `app/layout.tsx`:

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

Since `star-rating-x` uses React hooks and browser APIs internally, use it inside a **Client Component**:

```tsx
// components/ProductRating.tsx
"use client";

import { StarRating } from "star-rating-x";
import { useState } from "react";

export default function ProductRating() {
  const [rating, setRating] = useState(0);
  return <StarRating value={rating} onChange={setRating} />;
}
```

Then import it anywhere in your Server Components:

```tsx
// app/products/[id]/page.tsx
import ProductRating from "@/components/ProductRating";

export default function ProductPage() {
  return (
    <main>
      <h1>Rate this product</h1>
      <ProductRating />
    </main>
  );
}
```

### Pages Router (Next.js 12 and below)

Import the stylesheet in `pages/_app.tsx`:

```tsx
// pages/_app.tsx
import type { AppProps } from "next/app";
import "star-rating-x/styles.css";

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
```

Use `dynamic` with `ssr: false` if you encounter SSR issues:

```tsx
import dynamic from "next/dynamic";

const StarRating = dynamic(
  () => import("star-rating-x").then((mod) => mod.StarRating),
  { ssr: false },
);
```

---

## Props

| Prop                | Type                                                     | Default    | Description                                |
| ------------------- | -------------------------------------------------------- | ---------- | ------------------------------------------ |
| `value`             | `number`                                                 | —          | Controlled value (0–count)                 |
| `defaultValue`      | `number`                                                 | `0`        | Uncontrolled initial value                 |
| `count`             | `number`                                                 | `5`        | Total number of stars                      |
| `precision`         | `1 \| 0.5`                                               | `1`        | Whole or half-star                         |
| `size`              | `number \| string`                                       | `32`       | Star size in px                            |
| `gap`               | `number`                                                 | `6`        | Gap between stars in px                    |
| `shape`             | `StarShape`                                              | `"star"`   | Icon shape (see below)                     |
| `theme`             | `ThemeName`                                              | `"gold"`   | Colour theme (see below)                   |
| `filledColor`       | `string`                                                 | —          | Override filled colour                     |
| `emptyColor`        | `string`                                                 | —          | Override empty colour                      |
| `strokeColor`       | `string`                                                 | —          | Override stroke colour                     |
| `strokeWidth`       | `number`                                                 | `1.5`      | SVG stroke width                           |
| `readOnly`          | `boolean`                                                | `false`    | Disable interaction, keep styling          |
| `disabled`          | `boolean`                                                | `false`    | Disable + grey out                         |
| `allowClear`        | `boolean`                                                | `true`     | Re-click to reset to 0                     |
| `showValue`         | `boolean`                                                | `false`    | Show numeric label                         |
| `tooltips`          | `string[]`                                               | —          | Custom tooltip per star                    |
| `animation`         | `AnimationType`                                          | `"bounce"` | Click animation                            |
| `direction`         | `"ltr" \| "rtl"`                                         | `"ltr"`    | Layout direction                           |
| `highlightSelected` | `boolean`                                                | `false`    | Ring on selected star                      |
| `label`             | `string`                                                 | `"Rating"` | ARIA label                                 |
| `character`         | `string \| ((ctx: CharacterRenderContext) => ReactNode)` | —          | ✨ v2 — Emoji or text instead of SVG       |
| `customIcon`        | `string \| ((ctx: IconRenderContext) => ReactNode)`      | —          | ✨ v2 — Custom SVG path or render fn       |
| `mountAnimation`    | `boolean`                                                | `false`    | ✨ v2 — Count-up animation on first render |
| `mountDuration`     | `number`                                                 | `600`      | ✨ v2 — Duration of mount animation in ms  |
| `onChange`          | `(v: number) => void`                                    | —          | Value change callback                      |
| `onHoverChange`     | `(v: number \| null) => void`                            | —          | Hover change callback                      |

---

## Shapes

`"star"` · `"heart"` · `"circle"` · `"diamond"` · `"thumb"` · `"flag"` · `"lightning"` · `"flower"`

```jsx
<StarRating shape="heart" theme="rose" />
<StarRating shape="thumb" theme="ocean" />
<StarRating shape="lightning" theme="neon" />
```

---

## Themes

`"gold"` · `"fire"` · `"ocean"` · `"neon"` · `"rose"` · `"mono"` · `"violet"` · `"sunset"` · `"mint"`

```jsx
<StarRating theme="fire" />
<StarRating theme="neon" />
<StarRating theme="violet" />
```

Or override colours directly:

```jsx
<StarRating filledColor="#FF6B6B" emptyColor="#FFE0E0" strokeColor="#CC0000" />
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

## v2 Features

### `character` — Emoji & Text Mode

Replace SVG icons with any emoji, Unicode symbol, or dynamic render function.

```jsx
// Same emoji for all stars
<StarRating character="😊" />

// Different emoji per star index
const emojis = ["😞", "😐", "🙂", "😀", "🤩"];
<StarRating character={({ index }) => emojis[index]} />

// Any text or symbol
<StarRating character="✦" />
<StarRating character="A" />
```

---

### `customIcon` — Custom SVG

Pass a raw SVG path string or a full render function for complete icon control.

```jsx
// SVG path string
<StarRating customIcon="M12 2 L15 9 L22 9 L17 14 L19 21 L12 17 L5 21 L7 14 L2 9 L9 9 Z" />

// Full render function
<StarRating
  customIcon={({ fill, fillColor, size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" fill={fillColor} />
    </svg>
  )}
/>
```

---

### `mountAnimation` — Count-up on Load

Animate the stars filling in when the component first mounts — great for product pages and reviews.

```jsx
<StarRating value={4} mountAnimation />
<StarRating value={4} mountAnimation mountDuration={800} />
```

---

### `RatingGroup` — Multiple Categories

Rate multiple categories at once with an auto-calculated overall average.

```jsx
import { RatingGroup } from "star-rating-x";

const [ratings, setRatings] = useState({});

<RatingGroup
  categories={[
    { key: "quality", label: "Quality" },
    { key: "value", label: "Value" },
    { key: "service", label: "Service" },
  ]}
  values={ratings}
  onChange={(key, val, all) => setRatings(all)}
  showAverage
  showValues
/>;
```

`RatingGroup` forwards all `StarRating` props via spread, so you can pass `theme`, `shape`, `animation`, etc. to style every row at once.

---

## `useRating` Hook

Use this hook to manage state outside the component:

```jsx
import { StarRating, useRating } from "star-rating-x";

function ProductRating() {
  const { value, handlers, reset } = useRating({ initialValue: 3 });

  return (
    <>
      <StarRating value={value} {...handlers} />
      <button onClick={reset}>Clear</button>
    </>
  );
}
```

---

## Accessibility

- Full keyboard navigation: `←` `→` `↑` `↓` `Home` `End`
- `role="slider"` with `aria-valuemin`, `aria-valuemax`, `aria-valuenow`
- `aria-label` per star (or custom `tooltips`)
- Focus-visible ring
- Respects `prefers-reduced-motion`

---

## TypeScript

The package ships with full `.d.ts` declarations. All props, shapes, themes, hook types, and v2 context interfaces are exported.

```ts
import type {
  StarRatingProps,
  StarShape,
  ThemeName,
  AnimationType,
  IconRenderContext,
  CharacterRenderContext,
} from "star-rating-x";
```

---

## Changelog

### v2.0.0 — May 5, 2025 ✨ Major Release

**New**

- `character` prop — use any emoji, text, or render function instead of SVG icons
- `customIcon` prop — pass a custom SVG path string or full render function
- `mountAnimation` + `mountDuration` props — count-up fill animation on first render
- `RatingGroup` component — rate multiple categories with auto overall average
- `IconRenderContext` and `CharacterRenderContext` TypeScript interfaces exported

**Improved**

- Full TypeScript rewrite — `forwardRef` properly typed with generics
- All implicit `any` parameters annotated — zero TS errors in strict mode
- `RatingGroup` forwards all `StarRating` props via spread

**Fixed**

- `forwardRef` generic type mismatch (`RefObject<unknown>` vs `HTMLSpanElement`)
- `THEMES` record type prevents implicit `any` index signature errors

### v1.0.1 — May 4, 2025

- Added npm metadata: `author.url`, `homepage`, `bugs.url`, `funding`

### v1.0.0 — May 3, 2025 🚀 Initial Release

- `StarRating` component with controlled and uncontrolled modes
- 9 built-in colour themes, 8 icon shapes, 4 click animations
- Half-star precision, RTL support, full keyboard navigation
- ARIA `role=slider`, `useRating` hook, full TypeScript declarations
- Zero runtime dependencies — only React as peer dep

---

## Links

- 📦 [npm](https://www.npmjs.com/package/star-rating-x)
- 🌐 [Live Demo](https://star-rating-x-demo.vercel.app/v2)
- 🐙 [GitHub](https://github.com/Abdelrahman968/star-rating-x)

---

## License

MIT © Abdelrahman Ayman
