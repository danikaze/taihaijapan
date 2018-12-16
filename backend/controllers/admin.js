const auth = require('../utils/auth');
const getPhotosAdmin = require('../models/gallery/get-photos').getPhotosAdmin;
const getConfig = require('../models/config/get-config').getConfig;

let routeAdmin;
let routeConfig;

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
