import { log } from '../../utils/log';
import { model } from '../index';
import { Photo } from '../interfaces';

/**
 * Get a list of photos, with their tags and images, based on a main query
 *
 * @param query name of the stmt to get the photo list base data
 */
function getPhotos(query): Promise<Photo[]> {
  return model.ready.then(({ stmt }) => new Promise<Photo[]>((resolve, reject) => {
    stmt[query].all([0], (errorSelect, photos) => {
      if (errorSelect) {
        reject(errorSelect);
        return;
      }

      let stmtLeft = photos.length * 2;
      if (stmtLeft === 0) {
        resolve(photos);
        return;
      }

      function checkDone() {
        stmtLeft--;
        if (stmtLeft === 0) {
          resolve(photos);
        }
      }

      for (const photo of photos) {
        // get tags
        stmt.selectTagsByPhoto.all([photo.id], (error, rows) => {
          if (error) {
            log.error('sqlite: getPhotos.tags', error.message);
            reject(error);
            return;
          }

          photo.tags = rows ? rows.map((tag) => tag.text) : [];
          checkDone();
        });

        // get images
        stmt.getImagesByPhoto.all([photo.id], (error, rows) => {
          if (error) {
            log.error('sqlite: getPhotos.images', error.message);
            reject(error);
            return;
          }

          photo.imgs = rows || [];
          checkDone();
        });
      }
    });
  }));
}

export const getPhotosAdmin = getPhotos.bind(null, 'getPhotosAdmin');
export const getPhotosPage = getPhotos.bind(null, 'getPhotosPage');
export const getPhotosIndex = getPhotos.bind(null, 'getPhotosIndex');
