import { Request, Response } from 'express';
import { getConfig } from '../../models/config/get-config';
import { getSizes } from '../../models/gallery/get-sizes';
import { getUsers } from '../../models/users/get-users';
import { ServerSettings } from '../../settings';

/**
 * Display the options in the admin page
 */
export function displayOptions(serverSettings: ServerSettings, request: Request, response: Response): void {
  const promises = [
    getConfig(),
    getSizes(),
    getUsers(),
  ];

  Promise.all(promises).then(([config, sizes, users]) => {
    const routeAdmin = serverSettings.adminUrl;
    const routeOptions = `${routeAdmin}/options`;

    response.render('admin-options', {
      sizes,
      config,
      routeAdmin,
      routeOptions,
      fullUrl: `${config['site.baseUrl']}${routeOptions}`,
      bodyId: 'page-admin-options',
      siteGlobalTitle: config['site.title'],
      admin: {
        id: users[0].id,
        username: users[0].username,
        email: users[0].email,
      },
    });
  });
}
