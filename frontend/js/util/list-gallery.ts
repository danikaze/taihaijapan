import '../polyfills/array-find-index';
import * as PhotoSwipe from 'photoswipe/';
import { Dict } from '../../../interfaces/frontend';
import { PhotoSwipeUi } from './photoswipe-ui';
import { html as photoswipeHtml } from './photoswipe-html';
import { chooseBestSize } from './choose-best-size';

const asArray = Array.prototype.slice;

export interface ListGalleryOptions {
  /** selector for the thumbnails in the page */
  thumbnailSelector: string;
  /** % of viewport required to fit while choosing an image to display */
  fitRatio: number;
  /** If there's any photo active when the gallery is created, specify its slug here */
  activeSlug?: string;
}

/**
 * Class to manage the Photo gallery displayed in the gallery section
 */
export class ListGallery {
  private readonly viewerElem;
  private readonly options: ListGalleryOptions;
  private readonly photos;
  private readonly sizes;
  private readonly thumbnails;
  private readonly biggestSizesLoaded;

  constructor(indexElem, viewerElem, sizes, galleryPhotos, options?: Partial<ListGalleryOptions>) {
    this.viewerElem = viewerElem;
    this.options = {
      thumbnailSelector: '#thumbnails > li',
      fitRatio: 0.75,
      ...options,
    };
    this.photos = galleryPhotos;
    this.sizes = sizes;
    this.thumbnails = asArray.call(document.querySelectorAll(this.options.thumbnailSelector));
    this.biggestSizesLoaded = {};

    this.createPhotoSwipeHtml();
    this.addThumbnailsLogic();

    const openFromHash = this.checkUrlHash();
    if (!openFromHash && options.activeSlug) {
      const photoIndex = galleryPhotos.findIndex((photo) => photo.slug === options.activeSlug);
      if (photoIndex !== -1) {
        this.createPhotoSwipe(photoIndex);
      }
    }
  }

  /**
   * @return Parameters of the URL hash (`#p1=v1&p2=v2`) as `{ p1: v1, p2: v2 }`
   */
  private static parseUrlHash(): Dict<string> {
    const hash = window.location.hash.substring(1).split('&');
    const params = {};

    hash.forEach((chunk) => {
      if (!chunk) {
        return;
      }

      const pair = chunk.split('=');
      if (pair.length < 2) {
        return;
      }

      params[pair[0]] = pair[1];
    });

    return params;
  }

  /**
   *
   * @param HTMLElement elem
   */
  private createPhotoSwipeHtml() {
    const elem = this.viewerElem;
    elem.className = 'pswp';
    elem.setAttribute('tabindex', '-1');
    elem.setAttribute('role', 'dialog');
    elem.setAttribute('aria-hidden', 'true');

    elem.innerHTML = photoswipeHtml;
  }

  /**
   *
   */
  private addThumbnailsLogic() {
    this.thumbnails.forEach((thumbnail, index) => {
      thumbnail.addEventListener('click', () => {
        this.createPhotoSwipe(index);
      });
    });
  }

  /**
   * Return the bounds of a DOM element in the page
   *
   * @param elems thumbnails elements to search into
   * @param index index of the desired thumbnail
   */
  private getElemBounds(elems: HTMLElement[], index: number) {
    const bounds = elems[index].getBoundingClientRect();
    const pageYScroll = window.pageYOffset || document.documentElement.scrollTop;

    return {
      x: bounds.left,
      y: bounds.top + pageYScroll,
      w: bounds.width,
    };
  }

  /**
   * @param photoIndex index of the photo to open the gallery with
   */
  private createPhotoSwipe(photoIndex?: number): void {
    const gallery = new PhotoSwipe(this.viewerElem, PhotoSwipeUi, this.photos, {
      index: photoIndex,
      showHideOpacity: true,
      getThumbBoundsFn: this.getElemBounds.bind(this, this.thumbnails),
      history: true,
      galleryUID: '',
      galleryPIDs: true,
      ui: {
        shareUrlReplaceRegExp: /^http(s?)(.*)\/(photo|gallery)\/(.*)pid=([^&]+)$/,
        shareUrlReplaceBy: 'https$2/photo/$5/',
        defaultShareText: 'taihaijapan | 退廃ジャパン',
      },
    });

    let bestSize = 0;

    // beforeResize + gettingData listeners, allows to load the correct size depending on the gallery viewport
    // (as srcset) http://photoswipe.com/documentation/responsive-images.html
    gallery.listen('beforeResize', () => {
      const newSize = chooseBestSize(gallery.viewportSize, this.sizes, this.options);
      if (bestSize !== newSize) {
        gallery.invalidateCurrItems();
        bestSize = newSize;
      }
    });

    gallery.listen('gettingData', (index, item) => {
      let biggestImage = this.biggestSizesLoaded[item.id];
      biggestImage = biggestImage ? Math.max(biggestImage, bestSize) : bestSize;

      this.biggestSizesLoaded[item.id] = biggestImage;
      const shownItem = item.imgs[biggestImage];
      item.src = shownItem.src;
      item.w = shownItem.width;
      item.h = shownItem.height;
      item.pid = item.slug;
    });

    gallery.init();
  }

  /**
   * @returns `true` if the gallery was opened from the url hash parameters.
   */
  private checkUrlHash(): boolean {
    const params = ListGallery.parseUrlHash();
    const pid = params.pid;
    if (pid) {
      const photoIndex = this.photos.findIndex((photo) => photo.slug === pid);
      if (photoIndex !== -1) {
        this.createPhotoSwipe(photoIndex);
        return true;
      }
    }

    return false;
  }
}
