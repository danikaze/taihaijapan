import { Request, Response } from 'express';
import { Config, Size, User } from '../../../interfaces/model';
import { getConfig } from '../../models/config/get-config';
import { getSizes } from '../../models/gallery/get-sizes';
import { getUsers } from '../../models/users/get-users';
import { ServerSettings } from '../../settings';
import { I18n } from '../../utils/i18n';

/**
 * Display the options in the admin page
 *
 * - params: none
 * - body: none
 */
export function displayOptions(
  i18n: I18n,
  serverSettings: ServerSettings,
  request: Request,
  response: Response): void {
  const promises: Promise<Config | Size[] | User[]>[] = [
    getConfig(),
    getSizes(),
    getUsers(),
  ];

  Promise.all(promises).then(([config, sizes, users]) => {
    const routeAdmin = serverSettings.adminUrl;
    const routeOptions = `${routeAdmin}/options`;
    const admin = {
      id: users[0].id,
      username: users[0].username,
      email: users[0].email,
      lang: users[0].lang,
    };

    response.render('admin-options', {
      admin,
      sizes,
      config,
      routeAdmin,
      routeOptions,
      t: i18n.getNamespace(admin.lang, 'admin').t,
      i18n: i18n.getNamespace(admin.lang, 'frontend').all(),
      languages: i18n.getAvailableLanguages(),
      fullUrl: `${config['site.baseUrl']}${routeOptions}`,
      bodyId: 'page-admin-options',
      siteGlobalTitle: config['site.title'],
    });
  });
}
