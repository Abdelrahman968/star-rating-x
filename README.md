# ⭐ star-rating-x

> A fully-featured, accessible, customisable React star-rating component.  
> Themes · Shapes · Animations · Half-star · RTL · TypeScript · Zero dependencies.

[![npm](https://img.shields.io/npm/v/star-rating-x)](https://www.npmjs.com/package/star-rating-x)
[![license](https://img.shields.io/npm/l/star-rating-x)](LICENSE)
[![types](https://img.shields.io/npm/types/star-rating-x)](https://www.npmjs.com/package/star-rating-x)

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

## Props

| Prop                | Type                          | Default    | Description                       |
| ------------------- | ----------------------------- | ---------- | --------------------------------- |
| `value`             | `number`                      | —          | Controlled value (0–count)        |
| `defaultValue`      | `number`                      | `0`        | Uncontrolled initial value        |
| `count`             | `number`                      | `5`        | Total number of stars             |
| `precision`         | `1 \| 0.5`                    | `1`        | Whole or half-star                |
| `size`              | `number \| string`            | `32`       | Star size in px                   |
| `gap`               | `number`                      | `6`        | Gap between stars in px           |
| `shape`             | `StarShape`                   | `"star"`   | Icon shape (see below)            |
| `theme`             | `ThemeName`                   | `"gold"`   | Colour theme (see below)          |
| `filledColor`       | `string`                      | —          | Override filled colour            |
| `emptyColor`        | `string`                      | —          | Override empty colour             |
| `strokeColor`       | `string`                      | —          | Override stroke colour            |
| `strokeWidth`       | `number`                      | `1.5`      | SVG stroke width                  |
| `readOnly`          | `boolean`                     | `false`    | Disable interaction, keep styling |
| `disabled`          | `boolean`                     | `false`    | Disable + grey out                |
| `allowClear`        | `boolean`                     | `true`     | Re-click to reset to 0            |
| `showValue`         | `boolean`                     | `false`    | Show numeric label                |
| `tooltips`          | `string[]`                    | —          | Custom tooltip per star           |
| `animation`         | `AnimationType`               | `"bounce"` | Click animation                   |
| `direction`         | `"ltr" \| "rtl"`              | `"ltr"`    | Layout direction                  |
| `highlightSelected` | `boolean`                     | `false`    | Ring on selected star             |
| `label`             | `string`                      | `"Rating"` | ARIA label                        |
| `onChange`          | `(v: number) => void`         | —          | Value change callback             |
| `onHoverChange`     | `(v: number \| null) => void` | —          | Hover change callback             |

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

The package ships with full `.d.ts` declarations. All props, shapes, themes, and hook types are exported.

```ts
import type {
  StarRatingProps,
  StarShape,
  ThemeName,
  AnimationType,
} from "star-rating-x";
```

---

## License

MIT © Abdelrahman Ayman
