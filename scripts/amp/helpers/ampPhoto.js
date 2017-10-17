const getSrcsetTag = require('../../../frontend/js/util/getSrcTag');

const sizesMediaTags = [
  '(min-width: 400) 50vw',
  '(min-width: 800) 33vw',
  '(min-width: 1200) 25vw',
  '100vw',
];
const defaultSize = 2;

/**
 * @returns {string} HTML for the `<noscript>` content of `<amp-img>`
 */
function imgPhoto(sizes, photo) {
  const img = photo.imgs[defaultSize];
  return `<img alt="${photo.id} photo"
      src="${img.src}"
      width="${img.w}"
      height="${img.h}"
      ${getSrcsetTag(photo.imgs)}
    >`;
}

/**
 * @param   {Object[]} sizes
 * @param   {Object}   photo
 * @returns {string}         HTML of the `<amp-img>` tag of the given photo
 */
function ampPhoto(sizes, photo) {
  const img = photo.imgs[defaultSize];
  return `<amp-img alt="${photo.id} photo"
      src="${img.src}"
      width="${img.w}"
      height="${img.h}"
      layout="responsive"
      ${getSrcsetTag(photo.imgs, sizesMediaTags)}
    >
    <noscript>
      ${imgPhoto(sizes, photo)}
    </noscript>
  </amp-img>`;
}

module.exports = {
  fn: ampPhoto,
  asnyc: false,
};
