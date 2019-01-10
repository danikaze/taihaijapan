import { displayIndex } from './gallery/display-index';
import { displayGallery } from './gallery/display-gallery';
import { EndPointsGetter } from './index';

export const galleryControllers: EndPointsGetter = () => [
  {
    method: 'get',
    path: '/',
    callback: displayIndex,
  },
  {
    method: 'get',
    path: '/gallery',
    callback: displayGallery,
  },
  {
    method: 'get',
    path: '/photo/:slug',
    callback: displayGallery,
  },
];
