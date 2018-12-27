import { fitRects } from './util/fit-rects';
import { SrcSetEmu } from './util/src-set-emu';

import '../styles/index.scss';

interface AppWindow extends Window {
  start(sizes, photos): void;
}

const thumbnails = document.getElementById('thumbnails');
const options = {
  scrollFrequency: 1000 / 60,
  scrollDuration: 150,
  marginH: 10,
};

let photoList;
let srcSetEmu;

/**
 * Resize an image to fit in a box
 */
function fitImage(photo, maxW?, maxH?) {
  if (!maxW) {
    photo.elem.onload = null;
    maxW = thumbnails.offsetWidth;
    maxH = window.innerHeight - (options.marginH * 2);
  }
  const elem = photo.elem;
  const size = fitRects(elem.width, elem.height, maxW, maxH);
  elem.style.width = `${size.w}px`;

  srcSetEmu.updateImage(photo.id);
}

/**
 * Resize photos to fit in the screen
 */
function fitImages() {
  const maxW = thumbnails.offsetWidth;
  const maxH = window.innerHeight - (options.marginH * 2);

  fitImage(photoList[0], maxW, maxH);
}

function start(sizes, photos) {
  const imgElems = thumbnails.querySelectorAll('.img-0 img');
  srcSetEmu = new SrcSetEmu(sizes, null, { auto: false });

  const img = imgElems[0] as HTMLImageElement;
  const photo = photos[0];
  srcSetEmu.addImage(img, photo.imgs, photo.id);
  photo.elem = img;

  if (img.width && img.height) {
    fitImage(photo);
  } else {
    img.onload = fitImage.bind(null, photo, null, null);
  }

  photoList = photos;
  window.addEventListener('resize', fitImages);
}

(window as AppWindow).start = start;
