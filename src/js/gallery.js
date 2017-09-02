import '../styles/index.scss';

import requestJson from './util/requestData/requestJson';
import settings from './util/settings';
import googleAnalytics from './util/GoogleAnalytics';
import ListGallery from './util/ListGallery';

const THUMBNAIL_ID = 'thumbnails';
const GALLERY_ID = 'gallery';

function run() {
  requestJson(settings.galleryDbUrl, settings.ajax)
    .then((data) => {
      const galleryContainer = document.getElementById(THUMBNAIL_ID);
      const galleryViewer = document.getElementById(GALLERY_ID);

      // eslint-disable-next-line no-new
      new ListGallery(galleryContainer, galleryViewer, data.photos, {
        sizes: data.sizes,
      });
    });

  googleAnalytics.insert();
}

run();
