const bodyParser = require('body-parser');
const auth = require('../utils/auth');

const displayGallery = require('./admin/display-gallery').displayGallery;
const addPhoto = require('./admin/add-photo').addPhoto;
const initUpload = require('./admin/add-photo').init;
const updatePhoto = require('./admin/update-photo').updatePhoto;
const deletePhoto = require('./admin/delete-photo').deletePhoto;

const displayOptions = require('./admin/display-options').displayOptions;
const updateOptions = require('./admin/update-options').updateOptions;

module.exports = (app, serverSettings, config) => {
  initUpload(config);
  const routeAdmin = serverSettings.adminUrl;
  const routePhoto = `${routeAdmin}/photos`;
  const routePhotoId = `${routePhoto}/:photoId`;
  const routeOptions = `${routeAdmin}/options`;

  return [
    // get the whole gallery
    {
      method: 'get',
      path: routeAdmin,
      callback: displayGallery.bind(null, serverSettings),
      middleware: auth.middleware(),
    },
    // add one photo
    {
      method: 'post',
      path: routePhoto,
      callback: addPhoto.bind(null, serverSettings),
      middleware: auth.middleware(),
    },
    // update one photo
    {
      method: 'put',
      path: routePhoto,
      callback: updatePhoto.bind(null, serverSettings),
      middleware: auth.middleware(),
    },
    // remove one photo
    {
      method: 'delete',
      path: routePhotoId,
      callback: deletePhoto.bind(null, serverSettings),
      middleware: auth.middleware(),
    },
    // get the gallery options
    {
      method: 'get',
      path: routeOptions,
      callback: displayOptions.bind(null, serverSettings),
      middleware: auth.middleware(),
    },
    // update the gallery options
    {
      method: 'post',
      path: routeOptions,
      callback: updateOptions.bind(null, serverSettings),
      middleware: [auth.middleware(), bodyParser.urlencoded({ extended: true })],
    },
  ];
};
