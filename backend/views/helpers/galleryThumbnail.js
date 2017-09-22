const getSrcsetTag = require('../utils/getSrcsetTag');

const sizesMediaTags = [
  '(min-width: 400) 50vw',
  '(min-width: 800) 33vw',
  '(min-width: 1200) 25vw',
  '100vw',
];

function galleryThumbnail() {
  return `<img src="${this.imgs[0].src}" ${getSrcsetTag([this.imgs[0]], sizesMediaTags)} alt="${this.id}">`;
}

module.exports = {
  fn: galleryThumbnail,
  asnyc: false,
};
