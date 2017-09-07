/**
 * Choose the smallest size that fits the specified viewport
 *
 * @param  {Object}   viewport             Viewport to fit as `{ x, y }`
 * @param  {Object}   options
 * @param  {Object[]} options.sizes        List of available sizes as `{ w, h }`
 * @param  {number}   [options.fitRatio=1] Percentage of the viewport to fit
 * @return {number}                        Index of the best size use with this viewport size
 */
function chooseBestSize(viewport, options) {
  const sizes = options.sizes;
  const fitRatio = options.fitRatio || 1;
  const w = viewport.x * window.devicePixelRatio * fitRatio;
  const h = viewport.y * window.devicePixelRatio * fitRatio;
  const last = sizes.length - 1;

  for (let i = 0; i < last; i++) {
    const size = sizes[i];
    if ((!size.w || size.w > w) && (!size.h || size.h > h)) {
      return i;
    }
  }

  return last;
}

module.exports = chooseBestSize;
