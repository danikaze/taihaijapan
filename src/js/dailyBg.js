/**
 * Set the background of the page depending on the day
 *
 * @param {Dom}      bgElem        Element to set the background to
 * @param {Object[]} galleryPhotos list of photos as `{ w, h, src }`
 */
function setDailyBg(bgElem, galleryPhotos) {
  const todayImg = parseInt((new Date().getTime() / 86400000), 10) % galleryPhotos.length;
  bgElem.style.backgroundImage = `url(${galleryPhotos[todayImg][0].src})`;
}

module.exports = {
  set: setDailyBg,
};
