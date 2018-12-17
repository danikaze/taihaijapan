const log = require('../../utils/log');
const db = require('../index');

/**
 * Return all the information of the photo with the specified id
 *
 * @param id
 */
function getPhoto(id) {
  return db.ready.then(({ stmt }) => new Promise((resolve, reject) => {
    const photoData = {};
    let leftStmt = 3;

    function checkDone() {
      leftStmt--;
      if (leftStmt === 0) {
        resolve(photoData);
      }
    }

    const stmtParams = [Number(id)];

    // get basic photo data
    stmt.selectPhoto.get(stmtParams, (error, row) => {
      if (error) {
        log.error('sqlite: getPhoto.basic', error);
        reject(error);
      }

      Object.assign(photoData, row);
      checkDone();
    });

    // get tags
    stmt.selectTagsByPhoto.all(stmtParams, (error, rows) => {
      if (error) {
        log.error('sqlite: getPhoto.tags', error);
        reject(error);
      }

      photoData.tags = rows ? rows.map((tag) => tag.text) : [];
      checkDone();
    });

    // get images
    stmt.getImageSrcs.all(stmtParams, (error, rows) => {
      if (error) {
        log.error('sqlite: getPhoto.images', error);
        reject(error);
        return;
      }

      photoData.imgs = rows || [];
      checkDone();
    });
  }));
}

module.exports = getPhoto;
