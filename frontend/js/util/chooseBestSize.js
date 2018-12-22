/**
 * Choose the smallest size that fits the specified viewport
 *
 * @param  {Object}   viewport             Viewport to fit as `{ x, y }`
 * @param  {Object[]} sizes        List of available sizes as `{ w, h }`
 * @param  {Object}   options
 * @param  {number}   [options.fitRatio=1] Percentage of the viewport to fit
 * @return {number}                        Index of the best size use with this viewport size
 */
function chooseBestSize(viewport, sizes, options) {
  const fitRatio = (options && options.fitRatio) || 1;
  const w = viewport.x * window.devicePixelRatio * fitRatio;
  const h = viewport.y * window.devicePixelRatio * fitRatio;
  const last = sizes.length - 1;

  for (let i = 0; i < last; i++) {
    const size = sizes[i];
    if ((!size.width || size.width > w) && (!size.height || size.height > h)) {
      return i;
    }
  }

  return last;
}

module.exports = chooseBestSize;
