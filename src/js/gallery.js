import '../styles/index.scss';

import requestJson from './util/requestData/requestJson';
import settings from './util/settings';
import googleAnalytics from './util/GoogleAnalytics';
import ListGallery from './util/ListGallery';

const THUMBNAIL_ID = 'thumbnails';

function run() {
  requestJson(settings.galleryDbUrl, settings.ajax)
    .then((data) => {
      const galleryContainer = document.getElementById(THUMBNAIL_ID);
      // eslint-disable-next-line no-new
      new ListGallery(galleryContainer, data.photos);
    });

  googleAnalytics.insert();
}

run();
