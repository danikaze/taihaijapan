const Auth = require('../utils/Auth');
const settingsModel = require('../models/settings');
const galleryModel = require('../models/gallery');

const auth = new Auth();
let globalSettings;
let settings;
let photos;

function updateSettings() {
  globalSettings = settingsModel.data.global;
  settings = settingsModel.data.controllers.admin;
  auth.setCredentials(globalSettings.user, globalSettings.password);
  auth.setRealm(globalSettings.realm);
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
    }).catch((errorData) => {
      response.status(400).send({
        error: 'Wrong data',
        data: errorData,
      });
    });
  } catch (error) {
    response.status(400).send('Wrong data');
  }
}

function getGalleryData(request, response) {
  response.render('admin', {
    fullUrl: `https://taihaijapan.com${settings.route}`,
    bodyId: 'page-admin',
    siteGlobalTitle: globalSettings.title,
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
    }).catch((errorData) => {
      response.status(400).send({
        error: 'Wrong data',
        data: errorData,
      });
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
    middleware: auth.middleware(),
  },
  {
    method: 'put',
    path: `${settings.route}/photos`,
    callback: updatePhotos,
    middleware: auth.middleware(),
  },
  {
    method: 'delete',
    path: `${settings.route}/photos`,
    callback: removePhotos,
    middleware: auth.middleware(),
  },
];
