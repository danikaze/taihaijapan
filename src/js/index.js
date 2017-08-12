import '../styles/index.scss';

// import galleryMockupData from '../../build/photos/gallery.json';
// import setMockupData from './util/requestData/setMockupData';
import dailyBg from './util/dailyBg';
import requestJson from './util/requestData/requestJson';
import settings from './util/settings';
import VerticalGallery from './util/VerticalGallery';
import googleAnalytics from './util/GoogleAnalytics';

const BG_ID = 'bgImg';
const THUMBNAIL_ID = 'thumbnails';
const SOCIAL_ID = 'social';
const VIEW_MORE_ID = 'viewMore';

// setMockupData(settings.galleryDbUrl, galleryMockupData);

function run() {
  requestJson(settings.galleryDbUrl, settings.ajax)
    .then((data) => {
      const background = document.getElementById(BG_ID);
      const galleryContainer = document.getElementById(THUMBNAIL_ID);
      dailyBg.set(background, data.photos);
      settings.gallery.topDeadElement = document.getElementById(SOCIAL_ID);
      settings.gallery.bottomDeadElement = document.getElementById(VIEW_MORE_ID);
      // eslint-disable-next-line no-new
      new VerticalGallery(galleryContainer, data.photos, settings.gallery);
    });

  googleAnalytics.insert();
}

run();
