import { log } from '../../utils/log';
import { model } from '../index';
import { Tag } from '../../../interfaces/model';
import { InsertUniqueResult } from '../../../interfaces/model-ops';

/**
 * Get the current tags of a photo
 */
function getTags(photoId): Promise<Tag[]> {
  return model.ready.then(({ stmt }) => new Promise<Tag[]>((resolve, reject) => {
    stmt.selectTagsByPhoto.all([photoId], (error, tags) => {
      if (error) {
        log.error('sqlite: getTags', error.message);
        reject(error);
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
  return model.ready.then(({ stmt }) => new Promise((resolve, reject) => {
    // try to insert a new tag
    stmt.insertTag.run([text], function insertCallback(error) {
      if (error) {
        log.error('sqlite: insertOneTag', error.message);
        reject(error);
        return;
      }

      if (this.changes !== 0) {
        resolve({ id: this.lastID, isNew: true });
        return;
      }

      // if not inserted (was already there, get its id)
      stmt.selectTag.get([text], (selectError, row) => {
        if (selectError) {
          log.error('sqlite: insertOneTag.select', selectError.message);
          reject(selectError);
          return;
        }

        resolve({ id: row.id, isNew: false });
      });
    });
  }));
}

/**
 * Associate a tag with the given photoId
 */
function linkOneTag(photoId, tagId) {
  return model.ready.then(({ stmt }) => new Promise((resolve, reject) => {
    stmt.linkTag.run([photoId, tagId], (error) => {
      if (error) {
        log.error('sqlite: linkOneTag', error.message);
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
  return model.ready.then(({ stmt }) => new Promise((resolve, reject) => {
    stmt.unlinkTag.run([photoId, tagId], (error) => {
      if (error) {
        log.error('sqlite: unlinkOneTag', error.message);
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
export function updatePhotoTags(photoId, newTags) {
  return model.ready.then(({ stmt }) => new Promise((resolve, reject) => {
    getTags(photoId).then((currentTags) => {
      const toAdd = [];
      for (const tagText of newTags) {
        const i = currentTags.findIndex((tag) => tag.text === tagText);
        if (i === -1) {
          toAdd.push(tagText);
        }
      }

      const toDelete = [];
      for (const tag of currentTags) {
        if (newTags.indexOf(tag.text) === -1) {
          toDelete.push(tag.id);
        }
      }

      let stmtLeft = toAdd.length + toDelete.length;
      if (stmtLeft === 0) {
        resolve();
        return;
      }

      function checkDone(error) {
        if (error) {
          reject(error);
          return;
        }

        stmtLeft--;
        if (stmtLeft === 0) {
          stmt.purgeTags.run(); // no need to wait for this one
          resolve();
        }
      }

      for (const tagId of toDelete) {
        unlinkOneTag(photoId, tagId).then(checkDone);
      }

      for (const tagName of toAdd) {
        insertOneTag(tagName)
          .then(({ id }) => {
            linkOneTag(photoId, id).then(checkDone);
          })
          .catch(reject);
      }
    }).catch(reject);
  }));
}
