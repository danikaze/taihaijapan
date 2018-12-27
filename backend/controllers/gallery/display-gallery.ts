import { log } from '../../utils/log';
import { getPhotosIndex } from '../../models/gallery/get-photos';
import { getSizes } from '../../models/gallery/get-sizes';
import { getConfig } from '../../models/config/get-config';

/**
 * Display the list with the photo thumbnails
 *
 * @param request
 * @param response
 */
export function displayGallery(request, response) {
  const promises = [
    getSizes(),
    getPhotosIndex(),
    getConfig(),
  ];

  Promise.all(promises)
    .then(([sizes, photos, config]) => {
      const currentPhoto = request.params.slug
        && photos.filter((item) => item.slug === request.params.slug)[0];

      response.render('gallery', {
        bodyId: 'page-gallery',
        fullUrl: config['site.baseUrl'],
        siteGlobalTitle: `Gallery | ${config['site.title']}`,
        googleAnalyticsAccount: config['google.analytics'],
        photo: currentPhoto,
        photoSlug: currentPhoto && currentPhoto.slug,
        photos,
        sizes,
      });
    })
    .catch((error) => {
      log.error('index', error);
      response.status(500).send('Unexpected Error');
    });
}
