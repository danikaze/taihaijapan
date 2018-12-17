const log = require('../../utils/log');
const db = require('../');
const getSizes = require('./get-sizes');

/**
 * Add a new size to the database and return its id
 *
 * @param {*} size { label, width, height }
 */
function addSize(size) {
  return db.ready.then(({ stmt }) => new Promise((resolve, reject) => {
    const params = [
      size.label || '',
      size.width,
      size.height,
    ];

    stmt.insertSize.run(params, (error) => {
      if (error) {
        log.error('sqlite: addSize', error);
        reject(error);
        return;
      }
      resolve(this.lastID);
    });
  }));
}

/**
 * Update the values of an existing size
 *
 * @param {*} size { id, label, width, height }
 */
function updateSize(size) {
  return db.ready.then(({ stmt }) => new Promise((resolve, reject) => {
    const params = [
      size.label || '',
      size.width,
      size.height,
      size.id,
    ];

    stmt.updateSize.run(params, (error) => {
      if (error) {
        log.error('sqlite: updateSize', error);
        reject(error);
        return;
      }
      resolve();
    });
  }));
}

/**
 * Update the values of an existing size
 *
 * @param {*} size { id, label, width, height }
 */
function removeSize(sizeId) {
  return db.ready.then(({ stmt }) => new Promise((resolve, reject) => {
    stmt.updateSize.run([sizeId], (error) => {
      if (error) {
        log.error('sqlite: removeSize', error);
        reject(error);
        return;
      }
      resolve();
    });
  }));
}

/**
 * Set the thumbnail sizes, updating, removing and adding the needed ones
 *
 * @param {*} sizes Array<{ id, label, width, height }>
 */
function setSizes(newSizes) {
  return getSizes().then((currentSizes) => new Promise((resolve, reject) => {
    function toBeDeleted(size) {
      return newSizes.findIndex((newSize) => newSize.id === size.id) === -1;
    }

    const toDelete = currentSizes.filter(toBeDeleted);
    const promises = toDelete.map((size) => removeSize(size.id));

    newSizes.forEach((size) => {
      promises.push(size.id ? updateSize(size) : addSize(size));
    });

    Promise.all(promises)
      .then(() => { resolve(); })
      .catch(reject);
  }));
}

module.exports = setSizes;
