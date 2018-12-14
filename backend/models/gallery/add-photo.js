const createThumbnails = require('../../utils/create-thumbnails');
const dbReady = require('../index').ready;
const getSettings = require('../settings/get-settings').getSettings;
const getSizes = require('./get-sizes');
const updatePhotoTags = require('./update-photo-tags');

/**
 * Insert data as a new row in the `photos` table, returning a promise resolved to the new row ID.
 * It does not insert any related data.
 *
 * @param data
 */
function insertPhoto(photoData) {
  return dbReady.then(({ stmt }) => new Promise((resolve, reject) => {
    const data = [
      photoData.original,
      photoData.slug,
      photoData.title || '',
      photoData.keywords || '',
      photoData.visible,
    ];
    stmt.insertPhoto.run(data, function callback(error) {
      if (error) {
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
  return dbReady.then(({ stmt }) => new Promise((resolve, reject) => {
    const promises = thumbs.map((image) => new Promise((resolveOne, rejectOne) => {
      stmt.insertImage.run([photoId, image.width, image.height, image.src], (error) => {
        if (error) {
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
    getSettings(),
    getSizes(),
  ];

  return Promise.all(configPromises).then(([settings, sizes]) => new Promise((resolve, reject) => {
    const imagePromises = [];

    insertPhoto(photoData).then((photoId) => {
      const tagsPromise = updatePhotoTags(photoId, photoData.tags);
      imagePromises.push(tagsPromise);

      const thumbnailsOptions = {
        sizes,
        path: settings['images.path'],
        temporalPath: settings['images.temporalPath'],
        resize: {
          policy: settings['images.resize.policy'],
          outputFile: settings['images.resize.outputFile'],
          format: settings['images.resize.format'],
          formatOptions: settings['images.resize.formatOptions'],
        },
        baseUrl: settings['images.baseUrl'],
      };

      photoData.id = photoId;
      createThumbnails(photoData, thumbnailsOptions).then((imageData) => {
        insertImages(photoId, imageData)
          .then(resolve)
          .catch(reject);
      }).catch(reject);
    }).catch(reject);
  }));
}

module.exports = addPhoto;
