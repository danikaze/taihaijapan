/**
 * Fits a rectangle (w, h) in container (maxW, maxH).
 * The returned size is the one closest to the container (shrinked or expanded)
 *
 * @param   {number} w      original width
 * @param   {number} h      original height
 * @param   {number} [maxW] maximum width
 * @param   {number} [maxH] maximum height
 * @returns {object}        best size as `{ w, h }`
 */
function fitRects(w, h, maxW, maxH) {
  let ratio;

  if (!maxH) {
    ratio = maxW / w;
  } else if (!maxW) {
    ratio = maxH / h;
  } else {
    ratio = Math.min(maxW / w, maxH / h);
  }

  return {
    w: w * ratio,
    h: h * ratio,
  };
}

module.exports = fitRects;
