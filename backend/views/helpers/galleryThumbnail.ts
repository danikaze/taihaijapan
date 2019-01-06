import { getSrcsetTag } from '../utils/get-srcset-tags';

const sizesMediaTags = [
  '(min-width: 300) 50vw',
  '(min-width: 600) 33vw',
  '(min-width: 1200) 25vw',
  '100vw',
];

function galleryThumbnail() {
  return `<div><img src="${this.imgs[0].src}" ${getSrcsetTag([this.imgs[0]], sizesMediaTags)} alt="${this.id}"></div>`;
}

export default {
  fn: galleryThumbnail,
  async: false,
};
