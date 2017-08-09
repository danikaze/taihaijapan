import '../styles/index.scss';

// import galleryMockupData from '../../build/photos/gallery.json';
// import setMockupData from './requestData/setMockupData';
import dailyBg from './dailyBg';
import requestJson from './requestData/requestJson';
import settings from './settings';
import VerticalGallery from './VerticalGallery';
import googleAnalytics from './GoogleAnalytics';

const BG_ID = 'bgImg';
const THUMBNAIL_ID = 'thumbnails';
const SOCIAL_ID = 'social';

// setMockupData(settings.galleryDbUrl, galleryMockupData);

function run() {
  requestJson(settings.galleryDbUrl, settings.ajax)
    .then((data) => {
      const background = document.getElementById(BG_ID);
      const galleryContainer = document.getElementById(THUMBNAIL_ID);
      dailyBg.set(background, data.photos);
      settings.gallery.topDeadElement = document.getElementById(SOCIAL_ID);
      // eslint-disable-next-line no-new
      new VerticalGallery(galleryContainer, data.photos, settings.gallery);
    });

  googleAnalytics.insert('UA-5381936-2');
}

run();
