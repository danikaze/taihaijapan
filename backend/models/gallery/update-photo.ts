import { log } from '../../utils/log';
import { default as db } from '../index';
import { getPhoto } from './get-photo';
import { updatePhotoTags } from './update-photo-tags';

/**
 * Update `photos` table with the updateable data.
 * All of them is required
 */
function updatePhotoBaseData(photoId, newData) {
  return db.ready.then(({ stmt }) => new Promise((resolve, reject) => {
    const data = [
      newData.slug,
      newData.title,
      newData.keywords,
      newData.visible,
      photoId,
    ];

    stmt.updatePhoto.run(data, (error) => {
      if (error) {
        log.error('sqlite: updatePhotoBaseData', error);
        reject(error);
        return;
      }

      resolve();
    });
  }));
}

/**
 * Update a photo with new data.
 * Resolves with the updated one.
 *
 * @param photoId
 * @param newData
 */
export function updatePhoto(photoId, newData) {
  return Promise.all([
    updatePhotoBaseData(photoId, newData),
    updatePhotoTags(photoId, newData.tags),
  ]).then(() => getPhoto(photoId));
}
