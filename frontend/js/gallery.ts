/*
 * Entry point of the Gallery page
 */
import 'es6-object-assign/auto';
import 'es6-promise/auto';

import { Size, PublicPhoto } from '../../interfaces/frontend';
import { ListGallery } from './util/list-gallery';
import { loadSw } from './util/load-sw';
import { a2hs } from './util/a2hs';

interface AppWindow extends Window {
  start(sizes: Size[], photos: PublicPhoto[], activeSlug?: string): void;
}

const THUMBNAIL_ID = 'thumbnails';
const GALLERY_ID = 'gallery';

/**
 * Initialize the gallery page with data from the model
 *
 * @param sizes List of available sizes
 * @param photos List of photos to display
 * @param activeSlug If defined, slug of the photo to display when the fallery is created
 */
function start(sizes: Size[], photos: PublicPhoto[], activeSlug?: string): void {
  const galleryContainer = document.getElementById(THUMBNAIL_ID);
  const galleryViewer = document.getElementById(GALLERY_ID);

  new ListGallery(galleryContainer, galleryViewer, sizes, photos, { activeSlug });
}

(window as AppWindow).start = start;
loadSw('/sw.min.js');
a2hs(document.getElementById('a2hs-button'));
