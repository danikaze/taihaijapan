import { Request, Response } from 'express';
import { EndPointsGetter } from './index';
import { getConfig } from '../models/config/get-config';

function displayManifest(request: Request, response: Response) {
  getConfig().then((config) => {
    response.send({
      name: config['site.title'],
      short_name: config['site.shortname'],
      description: config['site.description'],
      background_color: 'black',
      theme_color: '#303030',
      display: 'fullscreen',
      icons: [
        {
          src: '/public/img/icon-192.png',
          sizes: '192x192',
          type: 'image/png',
        },
      ],
      start_url: '/',
    });
  });
}

export const manifestController: EndPointsGetter = () => [
  {
    method: 'get',
    path: '/manifest.webmanifest',
    callback: displayManifest,
  },
];
