import { getSrcsetTag } from '../utils/get-srcset-tags';

function indexThumbnail(index, options) {
  return `<li class="img-${index}"><div><a href="/photo/${this.slug}/">`
      + `<img src="${this.imgs[0].src}" ${getSrcsetTag(this.imgs)} alt="${this.title || this.slug}">`
    + '</a></div></li>';
}

export const helper = {
  fn: indexThumbnail,
  async: false,
};
