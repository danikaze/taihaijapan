import { getConfig } from '../../models/config/get-config';
import { getPhotosAdmin } from '../../models/gallery/get-photos';

/**
 * Get all the photos for the admin gallery
 * TODO: Pagination
 */
export function displayGallery(serverSettings, request, response) {
  const promises = [
    getConfig(),
    getPhotosAdmin(),
  ];

  Promise.all(promises).then(([config, photos]) => {
    const routeAdmin = serverSettings.adminUrl;
    const routeOptions = `${routeAdmin}/options`;

    response.render('admin', {
      photos,
      routeAdmin,
      routeOptions,
      fullUrl: `${config['site.baseUrl']}${routeAdmin}`,
      bodyId: 'page-admin',
      siteGlobalTitle: config['site.title'],
    });
  });
}
