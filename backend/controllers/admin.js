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
    routeAdmin: settings.route,
    routeOptions: `${settings.route}/options`,
    photos,
  });
}

function removePhotos(request, response) {
  try {
    const list = JSON.parse(request.query.photos);
    galleryModel.remove(list).then((data) => {
      response.send(data);
    });
  } catch (error) {
    response.status(400).send('Wrong data');
  }
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
  {
    method: 'delete',
    path: `${settings.route}/photos`,
    callback: removePhotos,
  },
];
