import { log } from '../../utils/log';
import { getPhotosIndex } from '../../models/gallery/get-photos';
import { getSizes } from '../../models/gallery/get-sizes';
import { getConfig } from '../../models/config/get-config';

/**
 * Display the index page
 *
 * @param request
 * @param response
 */
export function displayIndex(request, response) {
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
      log.error('index', error.message);
      response.status(500).send('Unexpected Error');
    });
}
