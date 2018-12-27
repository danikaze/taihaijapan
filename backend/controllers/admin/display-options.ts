import { getConfig } from'../../models/config/get-config';
import { getSizes } from'../../models/gallery/get-sizes';
import { getUsers } from'../../models/users/get-users';

/**
 * Display the options in the admin page
 *
 * @param {*} request
 * @param {*} response
 */
export function displayOptions(serverSettings, request, response) {
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
