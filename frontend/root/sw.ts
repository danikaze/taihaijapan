// tslint:disable:no-implicit-dependencies
import { default as WorkboxSW } from 'workbox-sw';
declare const workbox: typeof WorkboxSW;

interface MatchContext {
  event: {};
  url: URL;
}
type MatchCallback = (context: MatchContext) => {} | null;

const TTL_30_DAYS = 2592000; // 30 Days in seconds

const MAX_AGE_PAGES = TTL_30_DAYS;
const MAX_PHOTO_PAGES = 100;
const MAX_PHOTOS = 100;
const MAX_AGE_PHOTOS = TTL_30_DAYS;

importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.6.3/workbox-sw.js');

/**
 * Allow to match regexps against the url.pathname instead of the full url.fref
 */
function matchPathname(regExp: RegExp): MatchCallback {
  return ({ url }) => regExp.test(url.pathname);
}

if (workbox) {
  // cache html basic pages (index, gallery)
  workbox.routing.registerRoute(
    matchPathname(/(^\/$)|(gallery\/?$)/),
    workbox.strategies.networkFirst({
      cacheName: 'basic-pages-cache',
      plugins: [
        new workbox.expiration.Plugin({
          maxAgeSeconds: MAX_AGE_PAGES,
        }),
      ],
    })
  );

  // cache html photo pages
  workbox.routing.registerRoute(
    matchPathname(/^\/photo/),
    workbox.strategies.networkFirst({
      cacheName: 'photo-pages-cache',
      plugins: [
        new workbox.expiration.Plugin({
          maxEntries: MAX_PHOTO_PAGES,
          maxAgeSeconds: MAX_AGE_PAGES,
        }),
      ],
    })
  );

  // cache photo images
  workbox.routing.registerRoute(
    matchPathname(/^\/public\/photos\/.*\.jpg/),
    workbox.strategies.cacheFirst({
      cacheName: 'photo-images-cache',
      plugins: [
        new workbox.expiration.Plugin({
          maxEntries: MAX_PHOTOS,
          maxAgeSeconds: MAX_AGE_PHOTOS,
        }),
      ],
    })
  );

  // precache app files
  workbox.precaching.precacheAndRoute([]);
}
