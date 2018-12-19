const log = require('../utils/log');
const getPhotosIndex = require('../models/gallery/get-photos').getPhotosIndex;
const getSizes = require('../models/gallery/get-sizes');
const getConfig = require('../models/config/get-config').getConfig;

function gallery(request, response) {
  const promises = [
    getSizes(),
    getPhotosIndex(),
    getConfig(),
  ];

  Promise.all(promises)
    .then(([sizes, photos, config]) => {
      response.render('gallery', {
        bodyId: 'page-gallery',
        fullUrl: config['site.baseUrl'],
        siteGlobalTitle: `Gallery | ${config['site.title']}`,
        googleAnalyticsAccount: config['google.analytics'],
        sizes,
        photos,
      });
    })
    .catch((error) => {
      log.error('index', error);
      response.status(500).send('Unexpected Error');
    });
}

function photo(request, response) {
  const promises = [
    getSizes(),
    getPhotosIndex(),
    getConfig(),
  ];

  Promise.all(promises)
    .then(([sizes, photos, config]) => {
      const currentPhoto = request.params.slug
        && photos.filter((item) => item.slug === request.params.slug)[0];

      response.render('gallery', {
        bodyId: 'page-gallery',
        fullUrl: config['site.baseUrl'],
        siteGlobalTitle: `Gallery | ${config['site.title']}`,
        googleAnalyticsAccount: config['google.analytics'],
        photo: currentPhoto,
        photoSlug: currentPhoto && currentPhoto.slug,
        photos,
        sizes,
      });
    })
    .catch((error) => {
      log.error('index', error);
      response.status(500).send('Unexpected Error');
    });
}


module.exports = (app) => [
  {
    method: 'get',
    path: '/gallery',
    callback: gallery,
  },
  {
    method: 'get',
    path: '/photo/:slug',
    callback: photo,
  },
];
