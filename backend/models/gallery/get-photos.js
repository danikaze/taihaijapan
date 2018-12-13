const dbReady = require('../index').ready;

/**
 * Get a list of photos, with their tags and images, based on a main query
 *
 * @param query name of the stmt to get the photo list base data
 */
function getPhotos(query) {
  return dbReady.then(({ stmt }) => new Promise((resolve, reject) => {
    stmt[query].get([], (errorSelect, photos) => {
      let stmtLeft = photos.length * 2;

      function checkDone() {
        stmtLeft--;
        if (stmtLeft) {
          resolve(photos);
        }
      }

      if (errorSelect) {
        reject(errorSelect);
        return;
      }

      for (const photo of photos) {
        // get tags
        stmt.selectTagsByPhoto.all([photo.id], (error, rows) => {
          if (error) {
            reject(error);
            return;
          }

          photo.tags = rows;
          checkDone();
        });

        // get images
        stmt.getImageSrcs.all([photo.id], (error, rows) => {
          if (error) {
            reject(error);
            return;
          }

          photo.imgs = rows;
          checkDone();
        });
      }
    });
  }));
}

module.exports = {
  getPhotosAdmin: getPhotos.bind(null, 'getPhotosAdmin'),
  getPhotosPage: getPhotos.bind(null, 'getPhotosPage'),
  getPhotosIndex: getPhotos.bind(null, 'getPhotosIndex'),
};

