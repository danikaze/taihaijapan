import { chooseBestSize } from './choose-best-size';

/**
 * Class to manage images to emulate the srcSet behavior for IE browsers, which don't support it.
 */
export class SrcSetEmu {
  private ids;
  private readonly sizes;
  private readonly images;
  private readonly options;

  /**
   *
   * @param {object[]} sizes          List of ordered sizes as { w, h }[]
   * @param {object[]} [images]       List of images to manage as { elem, imgs, id }[]
   * @param {object}   [options]
   * @param {boolean}  [options.auto] If auto (default `true`), `updateImages` will be called on screen resize
   */
  constructor(sizes, images, options) {
    this.sizes = sizes;
    this.ids = 1;
    this.images = {};
    this.options = Object.assign({
      auto: true,
    }, options);

    if (images) {
      this.addImages(images);
    }

    if (this.options.auto) {
      window.addEventListener('load', this.updateImages.bind(this));
      window.addEventListener('resize', this.updateImages.bind(this));
    }
  }

  /**
   * Add a list of images to manage
   *
   * @param {object[]} images List of images to manage as { elem, imgs, [id] }[]
   */
  addImages(images) {
    images.forEach((item) => {
      this.addImage(item.elem, item.imgs, item.id);
    });
  }

  /**
   * Add one image to manage
   *
   * @param {HTMLImageElement} elem
   * @param {object[]}         imgs {w,h,src}[]
   * @param {*}                [id]
   */
  addImage(elem, imgs, id) {
    if (!id) {
      id = `srcSetId-${this.ids++}`;
    }

    this.images[id] = {
      elem,
      imgs,
      biggest: -1,
    };
  }

  /**
   * @param  {string} id
   * @param  {objet}  [viewport] {x, y} If not specified will use the size of the image
   * @return {string}            Index of the best size
   */
  getBestSize(id, viewport) {
    const item = this.images[id];
    if (!item) {
      return -1;
    }
    if (!viewport) {
      viewport = {
        x: item.elem.width,
        y: item.elem.height,
      };
    }

    const newBestSize = chooseBestSize(viewport, this.sizes);

    if (newBestSize > item.biggest) {
      item.biggest = newBestSize;
    }

    return item.biggest;
  }

  /**
   * Update all managed images based on the given viewport
   *
   * @param {object} [viewport] {x, y} If not specified will use the size of the image
   */
  updateImages(viewport) {
    Object.keys(this.images).forEach((id) => {
      this.updateImage.call(this, id, viewport);
    });
  }

  /**
   * Update one managed image based on the given viewport
   *
   * @param {string} id         Image id
   * @param {object} [viewport] {x, y} If not specified will use the size of the image
   */
  updateImage(id, viewport) {
    const item = this.images[id];
    const bestSize = this.getBestSize(id, viewport);
    item.elem.src = item.imgs[bestSize].src;
  }
}
