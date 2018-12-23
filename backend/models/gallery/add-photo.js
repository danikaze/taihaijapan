const log = require('../../utils/log');
const createThumbnails = require('../../utils/create-thumbnails');
const db = require('..');
const getConfig = require('../config/get-config').getConfig;
const getSizes = require('./get-sizes');
const updatePhotoTags = require('./update-photo-tags');

let serverSettings;

/**
 * Insert data as a new row in the `photos` table, returning a promise resolved to the new row ID.
 * It does not insert any related data.
 *
 * @param data
 */
function insertPhoto(photoData) {
  return db.ready.then(({ stmt }) => new Promise((resolve, reject) => {
    const data = [
      photoData.original,
      photoData.slug,
      photoData.title || '',
      photoData.keywords || '',
      photoData.visible,
    ];
    stmt.insertPhoto.run(data, function callback(error) {
      if (error) {
        log.error('sqlite: addPhoto', error);
        reject(error);
        return;
      }
      resolve(this.lastID);
    });
  }));
}

/**
 * Insert images related to the specified photo into the database
 * @param {*} photoId
 * @param {*} thumbs
 */
function insertImages(photoId, thumbs) {
  return db.ready.then(({ stmt }) => new Promise((resolve, reject) => {
    const promises = thumbs.map((image) => new Promise((resolveOne, rejectOne) => {
      stmt.insertImage.run([photoId, image.width, image.height, image.src], (error) => {
        if (error) {
          log.error('sqlite: insertImages', error);
          rejectOne(error);
          return;
        }
        resolveOne();
      });
    }));

    Promise.all(promises)
      .then(resolve)
      .catch(reject);
  }));
}

/**
 * Add a new photo and all its related data to the gallery database
 *
 * @param photoData
 */
function addPhoto(photoData) {
  const configPromises = [
    getConfig(),
    getSizes(),
  ];

  return Promise.all(configPromises).then(([config, sizes]) => new Promise((resolve, reject) => {
    const imagePromises = [];

    insertPhoto(photoData).then((photoId) => {
      const tagsPromise = updatePhotoTags(photoId, photoData.tags);
      imagePromises.push(tagsPromise);

      const thumbnailsOptions = {
        sizes,
        path: serverSettings.imagesThumbPath,
        temporalPath: serverSettings.imagesTemporalPath,
        resize: {
          policy: 'inside',
          outputFile: '{id:3}/{size}-{hash:16}.jpg',
          format: 'jpeg',
        },
        baseUrl: serverSettings.imagesBaseUrl,
      };

      photoData.id = photoId;
      createThumbnails(photoData, thumbnailsOptions).then((imageData) => {
        log.verbose('add-photo', `New photo added (id: ${photoId}, slug: ${photoData.slug})`);
        log.silly('add-photo', `Created thumbnails for id ${photoId}: ${JSON.stringify(imageData, null, 2)}`);

        insertImages(photoId, imageData)
          .then(resolve)
          .catch(reject);
      }).catch(reject);
    }).catch(reject);
  }));
}

/**
 * Initialize the configuration module with the server settings
 */
function init(settings) {
  serverSettings = {
    imagesTemporalPath: settings.imagesTemporalPath,
    imagesThumbPath: settings.imagesThumbPath,
    imagesBaseUrl: settings.imagesBaseUrl,
  };
}

module.exports = {
  addPhoto,
  init,
};
