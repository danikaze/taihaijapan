import '../polyfills/array-find-index';
import * as PhotoSwipe from 'photoswipe/';
import { PhotoSwipeUi } from './photoswipe-ui';
import { html as photoswipeHtml } from './photoswipe-html';
import { chooseBestSize } from './choose-best-size';

const asArray = Array.prototype.slice;

export class ListGallery {
  private readonly indexElem;
  private readonly viewerElem;
  private readonly options;
  private readonly photos;
  private readonly sizes;
  private readonly thumbnails;
  private readonly biggestSizesLoaded;

  constructor(indexElem, viewerElem, sizes, galleryPhotos, options) {
    this.indexElem = indexElem;
    this.viewerElem = viewerElem;
    this.options = Object.assign({
      thumbnailSelector: '#thumbnails > li',
      fitRatio: 0.75,  // % of viewport required to fit while choosing an image to display
    }, options);
    this.photos = galleryPhotos;
    this.sizes = sizes;
    this.thumbnails = asArray.call(document.querySelectorAll(this.options.thumbnailSelector));
    this.biggestSizesLoaded = {};

    createPhotoSwipeHtml(this.viewerElem);
    addThumbnailsLogic.call(this);

    const openFromHash = checkUrlHash.call(this);
    if (!openFromHash && options.activeSlug) {
      const photoIndex = galleryPhotos.findIndex((photo) => photo.slug === options.activeSlug);
      if (photoIndex !== -1) {
        createPhotoSwipe.call(this, photoIndex);
      }
    }
  }
}

function addThumbnailsLogic() {
  const bindedCreatePhotoSwipe = createPhotoSwipe.bind(this);
  this.thumbnails.forEach((thumbnail, index) => {
    thumbnail.addEventListener('click', () => {
      bindedCreatePhotoSwipe(index);
    });
  });
}

/**
 * Return the bounds of a DOM element in the page
 *
 * @param {DOM[]}  elems thumbnails elements to search into
 * @param {number} index index of the desired thumbnail
 */
function getElemBounds(elems, index) {
  const bounds = elems[index].getBoundingClientRect();
  const pageYScroll = window.pageYOffset || document.documentElement.scrollTop;

  return {
    x: bounds.left,
    y: bounds.top + pageYScroll,
    w: bounds.width,
  };
}

/**
 * @this {ListGallery}
 * @param {number} [photoIndex] index of the photo to open the gallery with
 */
function createPhotoSwipe(photoIndex) {
  const gallery = new PhotoSwipe(this.viewerElem, PhotoSwipeUi, this.photos, {
    index: photoIndex,
    showHideOpacity: true,
    getThumbBoundsFn: getElemBounds.bind(this, this.thumbnails),
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

  // beforeResize + gettingData listeners, allows to load the correct size depending on the gallery viewport (as srcset)
  // http://photoswipe.com/documentation/responsive-images.html
  gallery.listen('beforeResize', () => {
    const newSize = chooseBestSize(gallery.viewportSize, this.sizes, this.options);
    if (bestSize !== newSize) {
      gallery.invalidateCurrItems();
      bestSize = newSize;
    }
  });

  gallery.listen('gettingData', (index, item) => {
    let biggestImage = this.biggestSizesLoaded[item.id];
    if (biggestImage) {
      biggestImage = Math.max(biggestImage, bestSize);
    } else {
      biggestImage = bestSize;
    }
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
 * @return {Object} Parameters of the URL hash (`#p1=v1&p2=v2`) as `{ p1: v1, p2: v2 }`
 */
function parseUrlHash(): { [k: string]: string } {
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
 * @this {ListGallery}
 * @returns {boolean} If the gallery was opened from the url hash parameters.
 */
function checkUrlHash() {
  const params = parseUrlHash();
  const pid = params.pid;
  if (pid) {
    const photoIndex = this.photos.findIndex((photo) => photo.slug === pid);
    if (photoIndex !== -1) {
      createPhotoSwipe.call(this, photoIndex);
      return true;
    }
  }

  return false;
}

/**
 *
 * @param {*} elem
 */
function createPhotoSwipeHtml(elem) {
  elem.className = 'pswp';
  elem.setAttribute('tabindex', '-1');
  elem.setAttribute('role', 'dialog');
  elem.setAttribute('aria-hidden', 'true');

  elem.innerHTML = photoswipeHtml;
}
