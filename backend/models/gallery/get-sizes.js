const dbReady = require('../index').ready;

/**
 * Get the different thumbnail sizes set in the database, ordered ASC by width
 */
function getSizes() {
  return dbReady.then(({ stmt }) => new Promise((resolve, reject) => {
    stmt.selectSizes.all([], (error, rows) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(rows);
    });
  }));
}

module.exports = getSizes;
