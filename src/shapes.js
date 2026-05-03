/**
 * SVG paths (viewBox 0 0 24 24) for each rating shape.
 */
export const SHAPE_PATHS = {
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  heart:
    "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
  circle: "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z",
  diamond: "M12 2 L22 12 L12 22 L2 12 Z",
  thumb:
    "M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14zm-7 11H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h2v11z",
  flag: "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7",
  lightning:
    "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  flower:
    "M12 2C9 2 9 6 12 6C9 6 7 9 9.5 11C7 9 3 10 3 13C3 16 7 16 9.5 14C7 16 8 20 11 21C11 18 12 16 12 16C12 16 13 18 13 21C16 20 17 16 14.5 14C17 16 21 16 21 13C21 10 17 9 14.5 11C17 9 15 6 12 6C15 6 15 2 12 2Z",
};

export function getStarPath(shape = "star") {
  return SHAPE_PATHS[shape] ?? SHAPE_PATHS.star;
}
