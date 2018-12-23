const getConfig = require('../../models/config/get-config').getConfig;
const getSizes = require('../../models/gallery/get-sizes');
const getUsers = require('../../models/users/get-users');

/**
 * Display the options in the admin page
 *
 * @param {*} request
 * @param {*} response
 */
function displayOptions(serverSettings, request, response) {
  const promises = [
    getConfig(),
    getSizes(),
    getUsers(),
  ];

  Promise.all(promises).then(([config, sizes, users]) => {
    const routeAdmin = serverSettings.adminUrl;
    const routeOptions = `${routeAdmin}/options`;

    response.render('admin-options', {
      fullUrl: `${config['site.baseUrl']}${routeOptions}`,
      bodyId: 'page-admin-options',
      siteGlobalTitle: config['site.title'],
      routeAdmin,
      routeOptions,
      admin: {
        id: users[0].id,
        username: users[0].username,
        email: users[0].email,
      },
      config,
      sizes,
    });
  });
}

module.exports = { displayOptions };
