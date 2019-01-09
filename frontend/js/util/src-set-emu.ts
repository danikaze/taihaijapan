import { Size, Dict, Image, Viewport as ViewPort } from '../../../interfaces/frontend';
import { chooseBestSize } from './choose-best-size';

export interface SrcSetEmuOptions {
  /** When `true`, a listener will be registered to check when the window is resized */
  auto: boolean;
}

export interface SrcSetEmuImage {
  /** Reference to the image element */
  elem: HTMLImageElement;
  /** List of available images of a photo */
  imgs: Image[];
  /** Unique identifier (auto-generated if not provided) */
  id?: string;
}

interface SrcSetEmuImageInternal {
  /** Reference to the image element */
  elem: HTMLImageElement;
  /** List of available images of a photo */
  imgs: Image[];
  /** Index of the biggest loaded image (from `imgs`) */
  biggest: number;
}

/**
 * Class to manage images to emulate the srcSet behavior for IE browsers, which don't support it.
 */
export class SrcSetEmu {
  /** Counter to generate unique ids */
  private static ids = 1;
  /** List of sizes to manage */
  private readonly sizes: Size[];
  /** List of images to manage */
  private readonly images: Dict<SrcSetEmuImageInternal>;
  /** Class options */
  private readonly options: SrcSetEmuOptions;

  /**
   * @param sizes   List of ordered sizes
   * @param images  List of images to manage
   * @param options Optional behavior of the class
   */
  constructor(sizes: Size[], images: SrcSetEmuImage[], options?: Partial<SrcSetEmuOptions>) {
    this.sizes = sizes;
    this.images = {};
    this.options = {
      auto: true,
      ...options,
    };

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
   * @param images List of images to manage
   */
  public addImages(images: SrcSetEmuImage[]) {
    images.forEach((item) => {
      this.addImage(item.elem, item.imgs, item.id);
    });
  }

  /**
   * Add one image to manage
   *
   * @param elem HTML Element of the image
   * @param imgs List of images of different size
   * @param id   Id to refer (autogenerated if not provided)
   */
  public addImage(elem: HTMLImageElement, imgs: Image[], id?: number | string): void {
    this.images[id || `srcSetId-${SrcSetEmu.ids++}`] = {
      elem,
      imgs,
      biggest: -1,
    };
  }

  /**
   * @param  id       ID of the image to retrieve
   * @param  viewport If not specified will use the size of the image
   * @return          Index of the best size
   */
  public getBestSize(id: string, viewport: ViewPort): number {
    const item = this.images[id];

    if (!item) {
      return -1;
    }

    const v = viewport ? viewport : {
      x: item.elem.width,
      y: item.elem.height,
    };

    const newBestSize = chooseBestSize(v, this.sizes);

    if (newBestSize > item.biggest) {
      item.biggest = newBestSize;
    }

    return item.biggest;
  }

  /**
   * Update all managed images based on the given viewport
   *
   * @param viewport If not specified will use the size of the image
   */
  public updateImages(viewport?: ViewPort): void {
    Object.keys(this.images).forEach((id) => {
      this.updateImage.call(this, id, viewport);
    });
  }

  /**
   * Update one managed image based on the given viewport
   *
   * @param id       Image id
   * @param viewport If not specified will use the size of the image
   */
  public updateImage(id: string, viewport?: ViewPort): void {
    const item = this.images[id];
    const bestSize = this.getBestSize(id, viewport);
    item.elem.src = item.imgs[bestSize].src;
  }
}
