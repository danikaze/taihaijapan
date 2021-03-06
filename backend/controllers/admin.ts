import * as bodyParser from 'body-parser';
import { auth } from '../utils/auth';
import { EndPointsGetter, EndPoint } from './index';

import { displayGallery } from './admin/display-gallery';
import { addPhoto } from './admin/add-photo';
import { updatePhoto } from './admin/update-photo';
import { deletePhoto } from './admin/delete-photo';

import { displayOptions } from './admin/display-options';
import { updateOptions } from './admin/update-options';

const authMiddleware = auth.middleware();
const bodyParserMiddleware = bodyParser.json();

export const adminControllers: EndPointsGetter = (i18n, settings) => {
  const routeAdmin = settings.server.adminUrl;
  const routePhoto = `${routeAdmin}/photos`;
  const routePhotoId = `${routePhoto}/:photoId`;
  const routeOptions = `${routeAdmin}/options`;

  return [
    // get the whole gallery
    {
      method: 'get',
      path: routeAdmin,
      callback: displayGallery.bind(null, i18n, settings.server),
      middleware: authMiddleware,
    },
    // add one photo
    {
      method: 'post',
      path: routePhoto,
      callback: addPhoto.bind(null, settings.server),
      middleware: authMiddleware,
    },
    // update one photo
    {
      method: 'put',
      path: routePhotoId,
      callback: updatePhoto.bind(null, settings.server),
      middleware: [authMiddleware, bodyParserMiddleware],
    },
    // remove one photo
    {
      method: 'delete',
      path: routePhotoId,
      callback: deletePhoto.bind(null, settings.server),
      middleware: authMiddleware,
    },
    // get the gallery options
    {
      method: 'get',
      path: routeOptions,
      callback: displayOptions.bind(null, i18n, settings),
      middleware: authMiddleware,
    },
    // update the gallery options
    {
      method: 'put',
      path: routeOptions,
      callback: updateOptions.bind(null, settings.server),
      middleware: [authMiddleware, bodyParserMiddleware],
    },
  ] as EndPoint[];
};
