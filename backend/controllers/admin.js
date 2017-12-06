const settingsModel = require('../models/settings');
const galleryModel = require('../models/gallery');

let settings;
let photos;

function updateSettings() {
  settings = settingsModel.data.controllers.admin;
  updateGallery();
}

function updateGallery() {
  photos = galleryModel.getPhotos({
    n: settings.imagesPerPage,
    sortBy: settings.sortBy,
    reverse: settings.reverse,
    deleted: true,
  });
}

function updatePhotos(request, response) {
  try {
    const data = JSON.parse(request.query.photos);
    galleryModel.update(data).then((updatedData) => {
      response.send(updatedData);
    });
  } catch (error) {
    response.status(400).send('Wrong data');
  }
}

function getGalleryData(request, response) {
  response.render('admin', {
    fullUrl: 'https://taihaijapan.com/admin',
    bodyId: 'page-admin',
    title: 'taihaijapan | 退廃ジャパン',
    photos,
  });
}

settingsModel.on('update', updateSettings);
galleryModel.on('update', updateGallery);
updateSettings();

module.exports = (app) => [
  {
    method: 'get',
    path: settings.route,
    callback: getGalleryData,
  },
  {
    method: 'put',
    path: `${settings.route}/photos`,
    callback: updatePhotos,
  },
];
