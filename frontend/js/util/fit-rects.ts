/**
 * Fits a rectangle (w, h) in container (maxW, maxH).
 * The returned size is the one closest to the container (shrinked or expanded)
 *
 * @param   w    original width
 * @param   h    original height
 * @param   maxW maximum width
 * @param   maxH maximum height
 * @returns      best size
 */
export function fitRects(w: number, h: number, maxW?: number, maxH?: number): { width: number, height: number } {
  let ratio;

  if (!maxH) {
    ratio = maxW / w;
  } else if (!maxW) {
    ratio = maxH / h;
  } else {
    ratio = Math.min(maxW / w, maxH / h);
  }

  return {
    width: w * ratio,
    height: h * ratio,
  };
}
