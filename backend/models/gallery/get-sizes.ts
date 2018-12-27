import { log } from '../../utils/log';
import { default as db } from '../index';
import { Size } from '../interfaces';
/**
 * Get the different thumbnail sizes set in the database, ordered ASC by width
 */
export function getSizes(): Promise<Size[]> {
  return db.ready.then(({ stmt }) => new Promise<Size[]>((resolve, reject) => {
    stmt.selectSizes.all([], (error, rows) => {
      if (error) {
        log.error('sqlite: getSizes', error);
        reject(error);
        return;
      }

      resolve(rows);
    });
  }));
}
