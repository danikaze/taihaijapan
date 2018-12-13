const dbReady = require('../index').ready;

/**
 * Get the current tags of a photo
 */
function getTags(photoId) {
  return dbReady.then(({ stmt }) => new Promise((resolve, reject) => {
    stmt.selectTagsByPhoto.all([photoId], (selectError, tags) => {
      if (selectError) {
        reject(selectError);
        return;
      }

      resolve(tags);
    });
  }));
}

/**
 * Insert a new tag or get the ID of the existing one
 */
function insertOneTag(text) {
  return dbReady.then(({ stmt }) => new Promise((resolve, reject) => {
    // try to insert a new tag
    stmt.insertTag.run([text], function insertCallback(insertError) {
      if (insertError) {
        reject(insertError);
        return;
      }

      if (this.changes !== 0) {
        resolve({ id: this.lastID, isNew: false });
        return;
      }

      // if not inserted (was already there, get its id)
      stmt.selectTag.get([text], (selectError, row) => {
        if (selectError) {
          reject(selectError);
          return;
        }

        resolve({ id: row.id, isNew: true });
      });
    });
  }));
}

/**
 * Associate a tag with the given photoId
 */
function linkOneTag(photoId, tagId) {
  return dbReady.then(({ stmt }) => new Promise((resolve, reject) => {
    stmt.linkTag.run([photoId, tagId], (error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  }));
}

/**
 * Unlink one tag from a photo.
 * This can leave unused tags in the `tags` table (needs purge)
 *
 * @param {*} tagId
 */
function unlinkOneTag(photoId, tagId) {
  return dbReady.then(({ stmt }) => new Promise((resolve, reject) => {
    stmt.unlinkTag.run([photoId, tagId], (error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  }));
}

/**
 * Set the specified list of tags to a photo.
 * Create (if not exist) tags and link them to the specified photo.
 * Remove the already linked ones not in the new list.
 *
 * @param {number} photoId
 * @param {string[]} tags
 */
function updatePhotoTags(photoId, newTags) {
  return dbReady.then(({ stmt }) => new Promise((resolve, reject) => {
    getTags(photoId).then((currentTags) => {
      const toAdd = [];
      for (const tagName of newTags) {
        if (currentTags.filter((tag) => tag.name === tagName).length === 0) {
          toAdd.push(tagName);
        }
      }

      const toDelete = [];
      for (const tag of currentTags) {
        if (newTags.indexOf(tag.name) === -1) {
          toDelete.push(tag.id);
        }
      }

      let stmtLeft = (toAdd.length * 2) + toDelete.length;

      function checkDone(error) {
        if (error) {
          reject(error);
          return;
        }

        stmtLeft--;
        if (stmtLeft === 0) {
          stmt.purgeTags(); // no need to wait for this one
          resolve();
        }
      }

      for (const tagId of toDelete) {
        unlinkOneTag(photoId, tagId).then(checkDone);
      }

      for (const tagName of toAdd) {
        insertOneTag(tagName)
          .then(({ id, isNew }) => {
            if (isNew) {
              checkDone();
              return;
            }
            linkOneTag(photoId, id).then(checkDone);
          })
          .catch(reject);
      }
    }).catch(reject);
  }));
}

module.exports = updatePhotoTags;
