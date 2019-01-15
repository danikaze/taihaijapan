import { Request, Response } from 'express';
import { getConfig } from '../../models/config/get-config';
import { getPhotosAdmin } from '../../models/gallery/get-photos';
import { I18n } from '../../utils/i18n';
import { ServerSettings } from '../../settings';

/**
 * Get all the photos for the admin gallery
 * TODO: Pagination
 *
 * - params: none
 * - body: none
 */
export function displayGallery(
  i18n: I18n,
  serverSettings: ServerSettings,
  request: Request,
  response: Response): void {
  const promises = [
    getConfig(),
    getPhotosAdmin(),
  ];

  Promise.all(promises).then(([config, photos]) => {
    const routeAdmin = serverSettings.adminUrl;
    const routeOptions = `${routeAdmin}/options`;
    const routePhoto = `${routeAdmin}/photos`;

    response.render('admin', {
      photos,
      routeAdmin,
      routeOptions,
      routePhoto,
      t: i18n.getNamespace('en', 'admin'),
      languages: i18n.getAvailableLanguages(),
      fullUrl: `${config['site.baseUrl']}${routeAdmin}`,
      bodyId: 'page-admin',
      siteGlobalTitle: config['site.title'],
    });
  });
}
