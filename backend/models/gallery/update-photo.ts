import { log } from '../../utils/log';
import { RESOURCE_NOT_FOUND_ERROR } from '../../../constants/errors';
import { model } from '../index';
import { getPhoto } from './get-photo';
import { updatePhotoTags } from './update-photo-tags';
import { Photo } from '../../../interfaces/model';
import { NewPhoto } from '../../../interfaces/model-ops';

/**
 * Update `photos` table with the updateable data.
 * All of them is required
 */
function updatePhotoBaseData(photoId: number, newData: NewPhoto): Promise<void> {
  return model.ready.then(({ stmt }) => new Promise<void>((resolve, reject) => {
    const data = [
      newData.slug,
      newData.title,
      newData.keywords,
      newData.visible,
      photoId,
    ];

    stmt.updatePhoto.run(data, function callback(error) {
      if (error) {
        log.error('sqlite: updatePhotoBaseData', error.message);
        throw new Error(error.message);
      }

      if (this.changes === 0) {
        reject(RESOURCE_NOT_FOUND_ERROR);
        return;
      }

      resolve();
    });
  }));
}

/**
 * Update a photo with new data.
 * Resolves with the updated data.
 * Rejects on error or invalid `photoId`
 */
export function updatePhoto(photoId: number, newData: NewPhoto): Promise<Photo> {
  return updatePhotoBaseData(photoId, newData)
    .then(() => updatePhotoTags(photoId, newData.tags))
    .then(() => getPhoto(photoId));
}
