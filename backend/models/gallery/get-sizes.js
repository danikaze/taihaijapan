const db = require('../index');

/**
 * Get the different thumbnail sizes set in the database, ordered ASC by width
 */
function getSizes() {
  return db.ready.then(({ stmt }) => new Promise((resolve, reject) => {
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
