const fs = require('fs');
const log = require('../../utils/log');
const db = require('../index');

/**
 * Get the list of the paths for the images associated to a photo
 * @param photoId
 */
function getImageSrcs(photoId) {
  return db.ready.then(({ stmt }) => new Promise((resolve, reject) => {
    stmt.getImageSrcs.all([photoId], (error, rows) => {
      if (error) {
        log.error('sqlite: getImageSrcs', error);
        reject(error);
        return;
      }
      resolve(rows.map((row) => row.src));
    });
  }));
}

/**
 * Remove a list of files
 * @param filePaths
 */
function deleteFiles(filePaths) {
  let left = filePaths.length;

  return new Promise((resolve, reject) => {
    function checkDone(error) {
      if (error) {
        log.error('deleteFiles', error);
        reject(error);
        return;
      }

      left--;
      if (left === 0) {
        resolve();
      }
    }

    filePaths.forEach((file) => {
      fs.unlink(file, checkDone);
    });
  });
}

/**
 * Remove a photo from the PHOTOS table
 * @param photoId
 */
function deletePhoto(photoId) {
  return db.ready.then(({ stmt }) => new Promise((resolve, reject) => {
    stmt.deletePhoto.run([photoId], (error, row) => {
      if (error) {
        log.error('sqlite: deletePhoto', error);
        reject(error);
        return;
      }

      resolve();
    });
  }));
}

/**
 * Remove a photo from the gallery (and all its related data)
 * @param id
 */
function removePhoto(id) {
  return new Promise((resolve, reject) => {
    const photoId = Number(id);

    getImageSrcs(photoId)
      .then((srcs) => {
        deleteFiles(srcs);
        deletePhoto(photoId)
          .then(resolve);
      })
      .catch(reject);
  });
}

module.exports = removePhoto;
