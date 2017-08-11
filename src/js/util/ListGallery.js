// import addEventListener from './addEventListener';
import getSrcsetTag from './getSrcTag';

const sizesMediaTags = [
  '(min-width: 400) 50vw',
  '(min-width: 800) 33vw',
  '(min-width: 1200) 25vw',
  '100vw',
];

class ListGallery {
  constructor(elem, galleryPhotos, options) {
    this.elem = elem;
    this.options = Object.assign({
      maxWidth: 400,
      maxHeight: 400,
    }, options);
    this.photos = filterPhotos(galleryPhotos, this.options);

    createThumbnails.call(this);
  }
}


function filterPhotos(photos, options) {
  photos.forEach((imgs, photoIndex) => {
    photos[photoIndex] = imgs.filter(img => img.w <= options.maxWidth && img.h <= options.maxHeight);
  });

  return photos;
}

/**
 * @param   {Object[]} imgs List of photos as [{ w, h, src }]
 * @returns {DOM}           `<li>` element for one photo, from the list of images
 */
function createThumbnail(imgs) {
  if (!imgs || !imgs.length) {
    return null;
  }

  const srcTag = `src="${imgs[0].src}"`;
  const srcsetTag = getSrcsetTag(imgs, sizesMediaTags);
  const li = document.createElement('li');
  li.innerHTML = `<img ${srcTag} ${srcsetTag}>`;

  return li;
}

/**
 * @param {Array[]} photos List of photos
 */
function createThumbnails() {
  const parent = this.elem;

  this.photos.forEach((photo) => {
    const li = createThumbnail(photo);
    parent.appendChild(li);
  });
}

export default ListGallery;
