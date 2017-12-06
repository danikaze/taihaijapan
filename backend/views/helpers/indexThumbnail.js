const getSrcsetTag = require('../utils/getSrcsetTag');

function indexThumbnail(index, options) {
  return `<li class="img-${index}"><div><a href="/photo/${this.slug}/">`
      + `<img src="${this.imgs[0].src}" ${getSrcsetTag(this.imgs)} alt="${this.title || this.slug}">`
    + '</a></div></li>';
}

module.exports = {
  fn: indexThumbnail,
  async: false,
};
