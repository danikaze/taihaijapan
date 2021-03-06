import { log } from '../../utils/log';
import { model } from '../index';
import { Size } from '../../../interfaces/model';
import { NewSize } from '../../../interfaces/model-ops';
import { getSizes } from './get-sizes';

/**
 * Add a new size to the database and return its id
 */
function addSize(size: NewSize): Promise<number> {
  return model.ready.then(({ stmt }) => new Promise<number>((resolve, reject) => {
    const params = [
      size.label || '',
      size.width,
      size.height,
      size.quality,
    ];

    stmt.insertSize.run(params, (error) => {
      if (error) {
        log.error('sqlite: addSize', error.message);
        reject(error);
        return;
      }
      resolve(this.lastID);
    });
  }));
}

/**
 * Update the values of an existing size
 */
function updateSize(size: Size): Promise<void> {
  return model.ready.then(({ stmt }) => new Promise<void>((resolve, reject) => {
    const params = [
      size.label || '',
      size.width,
      size.height,
      size.quality,
      size.id,
    ];

    stmt.updateSize.run(params, (error) => {
      if (error) {
        log.error('sqlite: updateSize', error.message);
        reject(error);
        return;
      }
      log.silly('updateSize', `size id: ${size.id} updated to ${JSON.stringify(size)}`);
      resolve();
    });
  }));
}

/**
 * Update the values of an existing size
 */
function removeSize(sizeId: number): Promise<void> {
  return model.ready.then(({ stmt }) => new Promise<void>((resolve, reject) => {
    stmt.updateSize.run([sizeId], (error) => {
      if (error) {
        log.error('sqlite: removeSize', error.message);
        reject(error);
        return;
      }
      log.silly('removeSize', `size id: ${sizeId} deleted`);
      resolve();
    });
  }));
}

/**
 * Compare two sizes and check if they are the same by value
 */
function isEqualSize(a: Size, b: Size): boolean {
  return a.label === b.label
    && a.width === b.width
    && a.height === b.height
    && a.quality === b.quality;
}

/**
 * Set the thumbnail sizes, updating, removing and adding the needed ones
 */
export function setSizes(newSizes: Size[]): Promise<void> {
  return getSizes().then((currentSizes) => new Promise<void>((resolve, reject) => {
    function toBeDeleted(size: Size): boolean {
      return newSizes.findIndex((newSize) => newSize.id === size.id) === -1;
    }

    const toDelete = currentSizes.filter(toBeDeleted);
    const promises: Promise<void | number>[] = toDelete.map((size) => removeSize(size.id));

    newSizes.forEach((newSize) => {
      if (newSize.id) {
        const size = currentSizes[currentSizes.findIndex((currentSize) => currentSize.id === newSize.id)];
        if (!isEqualSize(size, newSize)) {
          promises.push(updateSize(newSize));
        }
      } else {
        promises.push(addSize(newSize));
      }
    });

    Promise.all(promises)
      .then(() => { resolve(); })
      .catch(reject);
  }));
}
