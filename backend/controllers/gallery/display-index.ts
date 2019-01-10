import { HTTP_CODE_500_INTERNAL_SERVER_ERROR } from '../../../constants/http';
import { log } from '../../utils/log';
import { getPhotosIndex } from '../../models/gallery/get-photos';
import { getSizes } from '../../models/gallery/get-sizes';
import { getConfig } from '../../models/config/get-config';

/**
 * Display the index page
 *
 * This is a basic GET request that accepts no parameters
 */
export function displayIndex(request, response) {
  const promises = [
    getSizes(),
    getPhotosIndex(),
    getConfig(),
  ];

  Promise.all(promises)
    .then(([sizes, photos, config]) => {
      response.render('index', {
        sizes,
        photos,
        bodyId: 'page-index',
        fullUrl: config['site.baseUrl'],
        siteGlobalTitle: config['site.title'],
        googleAnalyticsAccount: config['google.analytics'],
      });
    })
    .catch((error) => {
      log.error('index', error.message);
      response.status(HTTP_CODE_500_INTERNAL_SERVER_ERROR).send('Unexpected Error');
    });
}
