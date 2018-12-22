const displayIndex = require('./gallery/display-index').displayIndex;
const displayGallery = require('./gallery/display-gallery').displayGallery;

module.exports = (app) => [
  {
    method: 'get',
    path: '/',
    callback: displayIndex,
  },
  {
    method: 'get',
    path: '/gallery',
    callback: displayGallery,
  },
  {
    method: 'get',
    path: '/photo/:slug',
    callback: displayGallery,
  },
];
