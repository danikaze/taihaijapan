import { Request, Response } from 'express';
import { Config, Size, User } from '../../../interfaces/model';
import { getConfig } from '../../models/config/get-config';
import { getSizes } from '../../models/gallery/get-sizes';
import { getUser } from '../../models/users/get-user';
import { Settings } from '../../settings';
import { I18n } from '../../utils/i18n';
import { compare } from 'bcrypt';

/**
 * Display the options in the admin page
 *
 * - params: none
 * - body: none
 */
export function displayOptions(
  i18n: I18n,
  settings: Settings,
  request: Request,
  response: Response): void {
  const ADMIN_USER_ID = 1;
  const promises = [
    getConfig(),
    getSizes(),
    getUser(ADMIN_USER_ID),
  ];

  Promise.all(promises as [Promise<Config>, Promise<Size[]>, Promise<User>]).then(([config, sizes, adminUser]) => {
    const routeAdmin = settings.server.adminUrl;
    const routeOptions = `${routeAdmin}/options`;
    const admin = {
      id: adminUser.id,
      username: adminUser.username,
      email: adminUser.email,
      lang: adminUser.lang,
    };
    const initialPassword = settings.initialUser.password;
    const pwdCheckPromise = admin.id === ADMIN_USER_ID && initialPassword ? compare(initialPassword, adminUser.password)
                                                                          : Promise.resolve(false);

    pwdCheckPromise.then((needsPasswordChange) => {
      response.render('admin-options', {
        admin,
        sizes,
        config,
        routeAdmin,
        routeOptions,
        needsPasswordChange,
        t: i18n.getNamespace(admin.lang, 'admin').t,
        i18n: i18n.getNamespace(admin.lang, 'frontend').all(),
        languages: i18n.getAvailableLanguages(),
        fullUrl: `${config['site.baseUrl']}${routeOptions}`,
        bodyId: 'page-admin-options',
        siteGlobalTitle: config['site.title'],
      });
    });
  });
}
