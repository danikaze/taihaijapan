import { User } from '../../../interfaces/model';
import { log } from '../../utils/log';
import { model } from '../index';

/**
 * Get a user by the id
 */
export function getUser(id: number): Promise<User> {
  return model.ready.then(({ stmt }) => new Promise<User>((resolve, reject) => {
    stmt.selectUserById.get([id], (error, row) => {
      if (error) {
        log.error('sqlite: getUser', error.message);
        reject(error);
        return;
      }

      resolve(row as User);
    });
  }));
}
