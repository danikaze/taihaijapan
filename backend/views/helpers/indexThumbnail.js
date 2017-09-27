const getSrcsetTag = require('../utils/getSrcsetTag');

function indexThumbnail(options) {
  return `<a href="/photo/${this.id}">`
      + `<img src="${this.imgs[0].src}" ${getSrcsetTag(this.imgs)} alt="${this.id}">`
    + '</a>';
}

module.exports = {
  fn: indexThumbnail,
  asnyc: false,
};
