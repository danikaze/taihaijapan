/**
 *
 * @param {boolean} db
 * @returns {boolean}
 */
function checkDuplicatedIds(db) {
  const ids = [];
  const duplicatedIds = [];

  db.photos.forEach((photo) => {
    const id = photo.id.toLowerCase();
    if (ids.indexOf(id) !== -1) {
      duplicatedIds.push(photo.id);
    } else {
      ids.push(photo.id);
    }
  });

  return duplicatedIds.length ? duplicatedIds : null;
}

/**
 *
 *
 * @param {object} db
 * @returns {Promise}
 */
function checkDatabase(db) {
  // order sizes
  db.sizes.sort((a, b) => ((a.w || 0) - (b.w || 0)) + ((a.h || 0) - (b.h || 0)));

  // perform checks
  return new Promise((resolve, reject) => {
    // list of checks to performs as { checkId: function(db): boolean }
    const checks = {
      duplicatedIds: checkDuplicatedIds,
    };
    const errors = {};
    let failed = false;

    Object.keys(checks).forEach((key) => {
      const res = checks[key](db);
      if (res) {
        errors[key] = res;
        failed = true;
      }
    });

    if (failed) {
      reject(errors);
    } else {
      resolve();
    }
  });
}

module.exports = checkDatabase;
