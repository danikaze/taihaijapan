import 'es6-object-assign/auto';
import Photoswipe from 'photoswipe/';
import '../polyfills/Array.findIndex';
import PhotoswipeUi from './PhotoswipeUi';
import photoswipeHtml from './PhotoswipeHtml';
import '../../styles/photoswipe/index.scss';
import addEventListener from './addEventListener';
import getSrcsetTag from './getSrcTag';
import chooseBestSize from './chooseBestSize';

const sizesMediaTags = [
  '(min-width: 400) 50vw',
  '(min-width: 800) 33vw',
  '(min-width: 1200) 25vw',
  '100vw',
];

class ListGallery {
  constructor(indexElem, viewerElem, galleryPhotos, options) {
    this.indexElem = indexElem;
    this.viewerElem = viewerElem;
    this.options = Object.assign({
      sizes: null,    // image sizes for calculation
      maxWidth: 400,  // for thumbnails
      maxHeight: 400, // for thumbnails
      fitRatio: 1.0,  // % of viewport required to fit while choosing an image to display
    }, options);
    this.photos = galleryPhotos;
    this.thumbnails = [];
    this.biggestSizesLoaded = {};

    createPhotoSwipeHtml(this.viewerElem);
    createThumbnails.call(this);
    checkUrl.call(this);
  }
}

/**
 * @this    {ListGallery}
 * @param   {string}      id   Id or slug of the image
 * @param   {Object[]}    imgs List of photos as [{ w, h, src }]
 * @returns {DOM}              `<li>` element for one photo, from the list of images
 */
function createThumbnail(id, imgs, index) {
  if (!imgs || !imgs.length) {
    return null;
  }

  const srcTag = `src="${imgs[imgs.length - 1].src}"`;
  const srcsetTag = getSrcsetTag(imgs, sizesMediaTags);
  const li = document.createElement('li');
  li.innerHTML = `<img ${srcTag} ${srcsetTag}>`;
  addEventListener(li, 'click', () => {
    createPhotoSwipe.call(this, index);
  });

  return li;
}

/**
 * @this {ListGallery}
 */
function createThumbnails() {
  const bindedCreateThumbnail = createThumbnail.bind(this);
  const parent = this.indexElem;
  this.photos.forEach((photo, index) => {
    const imgs = photo.imgs.filter(img => img.w <= this.options.maxWidth
                                    && img.h <= this.options.maxHeight);
    const li = bindedCreateThumbnail(photo.id, imgs, index);
    parent.appendChild(li);
    this.thumbnails.push(li.children[0]);
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
  const gallery = new Photoswipe(this.viewerElem, PhotoswipeUi, this.photos, {
    index: photoIndex,
    showHideOpacity: true,
    getThumbBoundsFn: getElemBounds.bind(this, this.thumbnails),
    history: true,
    galleryUID: '',
    galleryPIDs: true,
  });

  let bestSize = chooseBestSize(gallery.viewportSize, this.options);

  // beforeResize + gettingData listeners, allows to load the correct size depending on the gallery viewport (as srcset)
  // http://photoswipe.com/documentation/responsive-images.html
  gallery.listen('beforeResize', () => {
    const newSize = chooseBestSize(gallery.viewportSize, this.options);
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
    item.w = shownItem.w;
    item.h = shownItem.h;
    item.pid = item.id;
  });

  gallery.init();
}

/**
 * @return {Object} Parameters of the URL hash (`#p1=v1&p2=v2`) as `{ p1: v1, p2: v2 }`
 */
function parseUrlHash() {
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
 */
function checkUrl() {
  const params = parseUrlHash();
  const pid = params.pid;
  if (pid) {
    const photoIndex = this.photos.findIndex(photo => photo.id === pid);
    if (photoIndex !== -1) {
      createPhotoSwipe.call(this, photoIndex);
    }
  }
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

export default ListGallery;
