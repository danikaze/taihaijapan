import { log } from '../../utils/log';
import { model } from '../index';
import { Size } from '../../../interfaces/model';
/**
 * Get the different thumbnail sizes set in the database, ordered ASC by width
 */
export function getSizes(): Promise<Size[]> {
  return model.ready.then(({ stmt }) => new Promise<Size[]>((resolve, reject) => {
    stmt.selectSizes.all([], (error, rows) => {
      if (error) {
        log.error('sqlite: getSizes', error.message);
        reject(error);
        return;
      }

      resolve(rows);
    });
  }));
}
