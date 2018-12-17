const auth = require('../utils/auth');
const typify = require('../utils/typify');
const getPhotosAdmin = require('../models/gallery/get-photos').getPhotosAdmin;
const getConfig = require('../models/config/get-config').getConfig;
const photoSchema = require('../models/schemas/photos');
const updatePhoto = require('../models/gallery/update-photo');

let routeAdmin;
let routeConfig;

/**
 * Receive a list of photos to update as { id: newPhotoData }
 * Return the same list with the updated data
 *
 * @param {*} request
 * @param {*} response
 */
function updatePhotos(request, response) {
  try {
    const rawData = JSON.parse(request.query.photos);
    const promises = Object.keys(rawData).map((key) => {
      const id = Number(key);
      const photo = typify(rawData[key], photoSchema, { copy: true, includeExternal: false });
      const rawTags = rawData[key].tags;
      photo.tags = rawTags ? rawTags.split(',').map((tag) => tag.trim()).filter((tag) => tag.length > 0)
                           : [];

      return updatePhoto(id, photo);
    });

    Promise.all(promises).then((updatedPhotos) => {
      const updatedData = {};
      updatedPhotos.forEach((updatedPhoto) => {
        updatedData[updatedPhoto.id] = updatedPhoto;
      });
      response.send(updatedData);
    }).catch((error) => {
      response.status(400).send({
        error: 'Wrong data',
        data: error,
      });
    });
  } catch (error) {
    response.status(400).send('Wrong data');
  }
}

/**
 * Get all the photos for the admin gallery
 * TODO: Pagination
 *
 * @param {*} request
 * @param {*} response
 */
function getGalleryData(request, response) {
  const promises = [
    getConfig(),
    getPhotosAdmin(),
  ];

  Promise.all(promises).then(([config, photos]) => {
    response.render('admin', {
      fullUrl: `${config['site.baseUrl']}${routeAdmin}`,
      bodyId: 'page-admin',
      siteGlobalTitle: config['site.title'],
      routeAdmin,
      routeConfig,
      photos,
    });
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

module.exports = (app, serverSettings, config) => {
  routeAdmin = serverSettings.adminUrl;
  routeConfig = `${routeAdmin}/options`;
  const routePhotos = `${routeAdmin}/photos`;

  return [
    {
      method: 'get',
      path: routeAdmin,
      callback: getGalleryData,
      middleware: auth.middleware(),
    },
    {
      method: 'put',
      path: routePhotos,
      callback: updatePhotos,
      middleware: auth.middleware(),
    },
    {
      method: 'delete',
      path: routePhotos,
      callback: removePhotos,
      middleware: auth.middleware(),
    },
  ];
};
