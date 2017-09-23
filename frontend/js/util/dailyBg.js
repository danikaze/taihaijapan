import chooseBestSize from './chooseBestSize';

let biggestSizeIndex = -1;

/**
 * Set the background of the page depending on the day
 *
 * @param {Dom}      bgElem        Element to set the background to
 * @param {Object[]} galleryPhotos list of photos as `{ w, h, src }`
 */
function setDailyBg(bgElem, galleryPhotos, sizes) {
  const viewport = {
    x: window.innerWidth,
    y: window.innerHeight,
  };
  const bestSize = chooseBestSize(viewport, sizes);
  if (biggestSizeIndex > bestSize) {
    return;
  }
  biggestSizeIndex = bestSize;
  const todayImg = parseInt((new Date().getTime() / 86400000), 10) % galleryPhotos.length;
  bgElem.style.backgroundImage = `url(${galleryPhotos[todayImg].imgs[bestSize].src})`;
}

module.exports = {
  set: setDailyBg,
};
