import { Size, Viewport as ViewPort } from '../interfaces';

export interface Options {
  /** Percentage of the viewport to fit */
  fitRatio: number;
}

/**
 * Choose the smallest size that fits the specified viewport
 *
 * @param  viewport Viewport to fit
 * @param  sizes    List of available sizes
 * @param  options  Optional behavior
 * @return          Index of the best size use with this viewport size
 */
export function chooseBestSize(viewport: ViewPort, sizes: Size[], options?: Options): number {
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
