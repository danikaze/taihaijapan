/*
 * Entry point of the Index page
 */
import '../styles/index.scss';
import '../styles/photoswipe/index.scss';
import '../styles/photoswipe/skin/default-skin.scss';

import { Size, PublicPhoto } from './interfaces';
import { fitRects } from './util/fit-rects';
import { SrcSetEmu } from './util/src-set-emu';

interface AppWindow extends Window {
  start(sizes: Size[], photos: PublicPhoto[]): void;
}

interface PhotoListElem extends PublicPhoto {
  elem?: HTMLImageElement;
}

const MARGIN_H = 10;

const thumbnails = document.getElementById('thumbnails');
let photoList: PhotoListElem[];
let srcSetEmu: SrcSetEmu;

/**
 * Resize an image to fit in a box
 */
function fitImage(photo, maxW?: number, maxH?: number): void {
  let w: number;
  let h: number;

  if (maxW) {
    w = maxW;
    h = maxH;
  } else {
    photo.elem.onload = null;
    w = thumbnails.offsetWidth;
    h = window.innerHeight - (MARGIN_H * 2);
  }
  const elem = photo.elem;
  const size = fitRects(elem.width, elem.height, w, h);
  elem.style.width = `${size.width}px`;

  srcSetEmu.updateImage(photo.id);
}

/**
 * Resize photos to fit in the screen
 */
function fitImages(): void {
  const maxW = thumbnails.offsetWidth;
  const maxH = window.innerHeight - (MARGIN_H * 2);

  fitImage(photoList[0], maxW, maxH);
}

/**
 * Initialize the index page with data from the model
 *
 * @param sizes List of available sizes
 * @param photos List of photos to display
 */
function start(sizes: Size[], photos: PublicPhoto[]): void {
  if (photos.length === 0) {
    return;
  }

  const imgElems = thumbnails.querySelectorAll('.img-0 img');
  srcSetEmu = new SrcSetEmu(sizes, null, { auto: false });

  photoList = photos.map((photo, i) => ({
    ...photo,
    elem: imgElems[i] as HTMLImageElement,
  }));

  const photo = photoList[0];
  const img = photo.elem;
  srcSetEmu.addImage(img, photo.imgs, photo.id);

  if (img.width && img.height) {
    fitImage(photo);
  } else {
    img.onload = fitImage.bind(null, photo, null, null);
  }

  window.addEventListener('resize', fitImages);
}

(window as AppWindow).start = start;
