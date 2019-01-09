import { unlink } from 'fs';
import * as path from 'path';
import { log } from '../../utils/log';
import { model } from '../index';
import { getPhoto } from './get-photo';

/**
 * Get the list of the paths for the images associated to a photo
 */
function getImageSrcs(photoId: number): Promise<string[]> {
  return model.ready.then(({ stmt }) => new Promise<string[]>((resolve, reject) => {
    stmt.getImageSrcs.all([photoId], (error, rows) => {
      if (error) {
        log.error('sqlite: getImageSrcs', error.message);
        reject(error);
        return;
      }
      resolve(rows.map((row) => row.src));
    });
  }));
}

/**
 * Remove a list of files
 */
function deleteFiles(filePaths: string[]): Promise<void> {
  let left = filePaths.length;

  return new Promise<void>((resolve, reject) => {
    function checkDone(error) {
      if (error) {
        log.error('deleteFiles', error.message);
        reject(error);
        return;
      }

      left--;
      if (left === 0) {
        resolve();
      }
    }

    filePaths.forEach((file) => {
      unlink(file, checkDone);
    });
  });
}

/**
 * Remove a photo from the PHOTOS table
 */
function deletePhoto(photoId: number): Promise<void> {
  return model.ready.then(({ stmt }) => new Promise<void>((resolve, reject) => {
    stmt.deletePhoto.run([photoId], (error, row) => {
      if (error) {
        log.error('sqlite: deletePhoto', error.message);
        reject(error);
        return;
      }

      resolve();
    });
  }));
}

/**
 * Remove a list of photos from the gallery (and all its related data)
 */
export function removePhotos(photoIds: number[]): Promise<void> {
  const promises = photoIds.map((photoId) => new Promise<void>((resolve, reject) => {
    Promise.all([
      getPhoto(photoId),
      getImageSrcs(photoId),
    ]).then(([photoData, srcs]) => {
      const imagePaths = srcs.map((src) => path.join(path.resolve(__dirname, '..', '..'), src));
      imagePaths.push(photoData.original);

      // no need to wait for file deletion
      deleteFiles(imagePaths).catch(() => {
        log.error('removePhotos', `Error deleting some files of photo id ${photoId}`);
      });
      deletePhoto(photoId)
        .then(resolve);
    })
    .catch(reject);
  }));

  return Promise.all(promises).then(() => { return; });
}
