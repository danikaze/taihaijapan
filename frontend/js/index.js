import fitRects from './util/fitRects';
import SrcSetEmu from './util/SrcSetEmu';

const thumbnails = document.getElementById('thumbnails');
const options = {
  scrollFrequency: 1000 / 60,
  scrollDuration: 150,
  marginH: 10,
};

let photoList;
let animatedScrollTimeout;
let srcSetEmu;

/**
 * Scroll the window an offset in the specified time
 */
function animateScroll(offsetX, offsetY, time) {
  if (animatedScrollTimeout) {
    return;
  }

  let steps = (time || options.scrollDuration) / options.scrollFrequency;
  const dX = offsetX / steps;
  const dY = offsetY / steps;
  const targetX = window.scrollX - offsetX;
  const targetY = window.scrollY - offsetY;

  function move() {
    steps--;
    clearTimeout(animatedScrollTimeout);

    if (steps < 1) {
      window.scroll(targetX, targetY);
      animatedScrollTimeout = null;
    } else {
      window.scroll(window.scrollX - dX, window.scrollY - dY);
      animatedScrollTimeout = setTimeout(move, options.scrollFrequency);
    }
  }

  move();
}

/**
 * Center a bounding client rect in the screen
 */
function centerBounds(bounds, time) {
  if (!bounds) {
    return;
  }

  const dX = (window.innerWidth / 2) - bounds.left - (bounds.width / 2);
  const dY = (window.innerHeight / 2) - bounds.top - (bounds.height / 2);
  animateScroll(dX, dY, time);
}

/**
 * Center a photo in the screen after a scroll
 */
function centerImage(targetImg, time, force) {
  if (!targetImg) {
    targetImg = getMostCenteredImage();
  }

  if (!targetImg) {
    return;
  }

  centerBounds(targetImg.getBoundingClientRect(), time);
}

/**
 * Get the bounds of the image that needs to be centered
 * If the scroll is too high, it assumes no image is centered,
 *
 * @returns {<HTMLImageElement>} Most centered `<img>` element or `null` if none
 */
function getMostCenteredImage() {
  const screenCenterX = window.innerWidth / 2;
  const screenCenterY = window.innerHeight / 2;
  let minDistance = Infinity;
  let targetImage;
  let bounds;
  let dist;

  for (let i = 0; i < photoList.length; i++) {
    const img = photoList[i].elem;
    bounds = img.getBoundingClientRect();
    dist = Math.abs(((bounds.left + bounds.width) / 2) - screenCenterX)
         + Math.abs(((bounds.top + bounds.bottom) / 2) - screenCenterY);

    if (dist < minDistance) {
      targetImage = img;
      minDistance = dist;
    } else {
      return targetImage;
    }
  }

  return targetImage;
}

/**
 * Resize an image to fit in a box
 */
function fitImage(photo, maxW, maxH) {
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
function fitImages(center) {
  const maxW = thumbnails.offsetWidth;
  const maxH = window.innerHeight - (options.marginH * 2);
  const currentImg = getMostCenteredImage();

  photoList.forEach((img) => fitImage(img, maxW, maxH));
  if (center !== false) {
    centerImage(currentImg);
  }
}

function start(sizes, photos) {
  const imgElems = thumbnails.querySelectorAll('img');
  srcSetEmu = new SrcSetEmu(sizes, null, { auto: false });

  photos.forEach((photo, index) => {
    const img = imgElems[index];
    srcSetEmu.addImage(img, photo.imgs, photo.id);
    photo.elem = img;

    if (img.with && img.height) {
      fitImage(photo);
    } else {
      img.onload = fitImage.bind(null, photo, null, null);
    }
  });

  photoList = photos;
  window.addEventListener('resize', fitImages);
}

window.start = start;
