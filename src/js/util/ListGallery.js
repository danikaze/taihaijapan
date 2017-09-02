import Photoswipe from 'photoswipe/';
// import 'photoswipe/dist/photoswipe.css';
// import 'photoswipe/dist/default-skin/default-skin.css';
import PhotoswipeUi from './PhotoswipeUi';
import photoswipeHtml from './PhotoswipeHtml';
import '../../styles/photoswipe/index.scss';
import addEventListener from './addEventListener';
import getSrcsetTag from './getSrcTag';

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

    createThumbnails.call(this);
    createPhotoSwipeHtml(this.viewerElem);
  }
}

/**
 * @param   {Object[]} imgs List of photos as [{ w, h, src }]
 * @returns {DOM}           `<li>` element for one photo, from the list of images
 */
function createThumbnail(imgs, index) {
  if (!imgs || !imgs.length) {
    return null;
  }

  const srcTag = `src="${imgs[0].src}"`;
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
  this.photos.map(imgs => imgs.filter(img => img.w <= this.options.maxWidth
    && img.h <= this.options.maxHeight)).forEach((photo, index) => {
      const li = bindedCreateThumbnail(photo, index);
      parent.appendChild(li);
      this.thumbnails.push(li.children[0]);
    });
}

/**
 * Choose the smallest size that fits the specified viewport
 *
 * @param  {Object} viewport Viewport to fit
 * @param  {Object} options  Percentage of the viewport to fit
 * @return {number}          Best size index to use with this viewport size
 */
function chooseBestSize(viewport, options) {
  const sizes = options.sizes;
  const w = viewport.x * window.devicePixelRatio * options.fitRatio;
  const h = viewport.y * window.devicePixelRatio * options.fitRatio;
  const last = sizes.length - 1;

  for (let i = 0; i < last; i++) {
    const size = sizes[i];
    if ((!size.w || size.w > w) && (!size.h || size.h > h)) {
      return i;
    }
  }

  return last;
}

function getThumbBounds(thumbnails, index) {
  const bounds = thumbnails[index].getBoundingClientRect();
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
    getThumbBoundsFn: getThumbBounds.bind(this, this.thumbnails),
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
    const shownItem = item[bestSize];
    item.src = shownItem.src;
    item.w = shownItem.w;
    item.h = shownItem.h;
  });

  gallery.init();
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
