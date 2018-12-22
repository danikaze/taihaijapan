const log = require('../../utils/log');
const getPhotosIndex = require('../../models/gallery/get-photos').getPhotosIndex;
const getSizes = require('../../models/gallery/get-sizes');
const getConfig = require('../../models/config/get-config').getConfig;

/**
 * Display the index page
 *
 * @param {*} request
 * @param {*} response
 */
function displayIndex(request, response) {
  const promises = [
    getSizes(),
    getPhotosIndex(),
    getConfig(),
  ];

  Promise.all(promises)
    .then(([sizes, newPhotos, config]) => {
      response.render('index', {
        bodyId: 'page-index',
        fullUrl: config['site.baseUrl'],
        siteGlobalTitle: config['site.title'],
        googleAnalyticsAccount: config['google.analytics'],
        newPhotos,
        sizes,
      });
    })
    .catch((error) => {
      log.error('index', error);
      response.status(500).send('Unexpected Error');
    });
}

module.exports = { displayIndex };
