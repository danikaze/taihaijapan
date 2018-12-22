const getConfig = require('../../models/config/get-config').getConfig;
const getPhotosAdmin = require('../../models/gallery/get-photos').getPhotosAdmin;

/**
 * Get all the photos for the admin gallery
 * TODO: Pagination
 */
function displayGallery(serverSettings, request, response) {
  const promises = [
    getConfig(),
    getPhotosAdmin(),
  ];

  Promise.all(promises).then(([config, photos]) => {
    const routeAdmin = serverSettings.adminUrl;
    const routeOptions = `${routeAdmin}/options`;

    response.render('admin', {
      fullUrl: `${config['site.baseUrl']}${routeAdmin}`,
      bodyId: 'page-admin',
      siteGlobalTitle: config['site.title'],
      routeAdmin,
      routeOptions,
      photos,
    });
  });
}

module.exports = { displayGallery };
