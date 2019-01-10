import { log } from '../../utils/log';
import { createThumbnails, CreateThumbnailsOptions, ThumbnailPhotoData } from '../../utils/create-thumbnails';
import { model } from '../index';
import { Image } from '../../../interfaces/model';
import { NewPhoto } from '../../../interfaces/model-ops';
import { getSizes } from './get-sizes';
import { updatePhotoTags } from './update-photo-tags';
import { ServerSettings } from '../../settings';

let serverSettings;

/**
 * Insert data as a new row in the `photos` table, returning a promise resolved to the new row ID.
 * It does not insert any related data.
 */
function insertPhoto(photoData): Promise<number> {
  return model.ready.then(({ stmt }) => new Promise<number>((resolve, reject) => {
    const data = [
      photoData.original,
      photoData.slug,
      photoData.title || '',
      photoData.keywords || '',
      photoData.visible,
    ];
    stmt.insertPhoto.run(data, function callback(error) {
      if (error) {
        log.error('sqlite: addPhoto', error.message);
        reject(error);
        return;
      }
      resolve(this.lastID);
    });
  }));
}

/**
 * Insert images related to the specified photo into the database
 */
function insertImages(photoId: number, thumbs: Image[]): Promise<void> {
  return model.ready.then(({ stmt }) => new Promise<void>((resolve, reject) => {
    const promises = thumbs.map((image) => new Promise((resolveOne, rejectOne) => {
      stmt.insertImage.run([photoId, image.width, image.height, image.src], (error) => {
        if (error) {
          log.error('sqlite: insertImages', error.message);
          rejectOne(error);
          return;
        }
        resolveOne();
      });
    }));

    Promise.all(promises)
      .then(() => resolve())
      .catch(reject);
  }));
}

/**
 * Add a new photo and all its related data to the gallery database
 */
export function addPhoto(newPhoto: NewPhoto): Promise<void> {
  return getSizes().then((sizes) => new Promise<void>((resolve, reject) => {
    const imagePromises = [];

    insertPhoto(newPhoto).then((photoId) => {
      const tagsPromise = updatePhotoTags(photoId, newPhoto.tags);
      imagePromises.push(tagsPromise);

      const thumbnailsOptions: CreateThumbnailsOptions = {
        sizes,
        path: serverSettings.imagesThumbPath,
        temporalPath: serverSettings.imagesTemporalPath,
        outputFile: '{id:3}/{size}-{hash:16}.jpg',
        baseUrl: serverSettings.imagesBaseUrl,
      };

      const photoData: ThumbnailPhotoData = {
        id: photoId,
        original: newPhoto.original,
        slug: newPhoto.slug,
      };

      createThumbnails(photoData, thumbnailsOptions).then((imageData) => {
        log.verbose('add-photo', `New photo added (id: ${photoId}, slug: ${newPhoto.slug})`);
        log.silly('add-photo', `Created thumbnails for id ${photoId}: ${JSON.stringify(imageData, null, 2)}`);

        insertImages(photoId, imageData)
          .then(() => resolve())
          .catch(reject);
      }).catch(reject);
    }).catch(reject);
  }));
}

/**
 * Initialize the configuration module with the server settings
 */
export function init(settings: ServerSettings): void {
  serverSettings = {
    imagesTemporalPath: settings.imagesTemporalPath,
    imagesThumbPath: settings.imagesThumbPath,
    imagesBaseUrl: settings.imagesBaseUrl,
  };
}
