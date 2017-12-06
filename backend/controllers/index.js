const settingsModel = require('../models/settings');
const galleryModel = require('../models/gallery');

let settings;
let sizes;
let newPhotos;

function updateSettings() {
  settings = settingsModel.data.controllers.index;
  sizes = settingsModel.data.images.sizes;
  updateGallery();
}

function updateGallery() {
  newPhotos = galleryModel.getPhotos({
    n: settings.maxImages,
    sortBy: settings.sortBy,
    reverse: settings.reverse,
    deleted: false,
  });
}

function index(request, response) {
  response.render('index', {
    fullUrl: 'https://taihaijapan.com',
    bodyId: 'page-index',
    title: 'taihaijapan | 退廃ジャパン',
    newPhotos,
    sizes,
  });
}

settingsModel.on('update', updateSettings);
galleryModel.on('update', updateGallery);
updateSettings();

module.exports = (app) => [
  {
    method: 'get',
    path: '/',
    callback: index,
  },
];
