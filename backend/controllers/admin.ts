import * as bodyParser from 'body-parser';
import { auth } from '../utils/auth';
import { EndPointsGetter } from './index';

import { displayGallery } from './admin/display-gallery';
import { addPhoto } from './admin/add-photo';
import { init as initUpload } from './admin/add-photo';
import { updatePhoto } from './admin/update-photo';
import { deletePhoto } from './admin/delete-photo';

import { displayOptions } from './admin/display-options';
import { updateOptions } from './admin/update-options';

export const adminControllers: EndPointsGetter = (app, serverSettings, config) => {
  initUpload(serverSettings);
  const routeAdmin = serverSettings.adminUrl;
  const routePhoto = `${routeAdmin}/photos`;
  const routePhotoId = `${routePhoto}/:photoId`;
  const routeOptions = `${routeAdmin}/options`;

  return [
    // get the whole gallery
    {
      method: 'get',
      path: routeAdmin,
      callback: displayGallery.bind(null, serverSettings),
      middleware: auth.middleware(),
    },
    // add one photo
    {
      method: 'post',
      path: routePhoto,
      callback: addPhoto.bind(null, serverSettings),
      middleware: auth.middleware(),
    },
    // update one photo
    {
      method: 'put',
      path: routePhoto,
      callback: updatePhoto.bind(null, serverSettings),
      middleware: auth.middleware(),
    },
    // remove one photo
    {
      method: 'delete',
      path: routePhotoId,
      callback: deletePhoto.bind(null, serverSettings),
      middleware: auth.middleware(),
    },
    // get the gallery options
    {
      method: 'get',
      path: routeOptions,
      callback: displayOptions.bind(null, serverSettings),
      middleware: auth.middleware(),
    },
    // update the gallery options
    {
      method: 'post',
      path: routeOptions,
      callback: updateOptions.bind(null, serverSettings),
      middleware: [auth.middleware(), bodyParser.urlencoded({ extended: true })],
    },
  ];
};
