import { getConfig } from '../../models/config/get-config';
import { getPhotosAdmin } from '../../models/gallery/get-photos';

/**
 * Get all the photos for the admin gallery
 * TODO: Pagination
 *
 * - params: none
 * - body: none
 */
export function displayGallery(serverSettings, request, response) {
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
      fullUrl: `${config['site.baseUrl']}${routeAdmin}`,
      bodyId: 'page-admin',
      siteGlobalTitle: config['site.title'],
    });
  });
}
