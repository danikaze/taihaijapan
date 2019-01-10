import { HTTP_CODE_500_INTERNAL_SERVER_ERROR } from '../../../constants/http';
import { log } from '../../utils/log';
import { getPhotosPage } from '../../models/gallery/get-photos';
import { getSizes } from '../../models/gallery/get-sizes';
import { getConfig } from '../../models/config/get-config';

/**
 * Display the list with the photo thumbnails
 *
 * This is a basic request with no parameters
 */
export function displayGallery(request, response) {
  const promises = [
    getSizes(),
    getPhotosPage(),
    getConfig(),
  ];

  Promise.all(promises)
    .then(([sizes, photos, config]) => {
      const currentPhoto = request.params.slug
        && photos.filter((item) => item.slug === request.params.slug)[0];

      response.render('gallery', {
        sizes,
        photos,
        bodyId: 'page-gallery',
        fullUrl: config['site.baseUrl'],
        siteGlobalTitle: `Gallery | ${config['site.title']}`,
        googleAnalyticsAccount: config['google.analytics'],
        photo: currentPhoto,
        photoSlug: currentPhoto && currentPhoto.slug,
      });
    })
    .catch((error) => {
      log.error('index', error.message);
      response.status(HTTP_CODE_500_INTERNAL_SERVER_ERROR).send('Unexpected Error');
    });
}
