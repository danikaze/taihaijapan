const getSrcsetTag = require('../utils/getSrcsetTag');

function indexThumbnail(index, options) {
  return `<li class="img-${index}"><div><a href="/photo/${this.id}/">`
      + `<img src="${this.imgs[0].src}" ${getSrcsetTag(this.imgs)} alt="${this.id}">`
    + '</a></div></li>';
}

module.exports = {
  fn: indexThumbnail,
  async: false,
};
