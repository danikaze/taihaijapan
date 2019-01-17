import { User } from '../../../interfaces/model';
import { log } from '../../utils/log';
import { model } from '../index';

/**
 * Get all users in the system
 */
export function getUsers(): Promise<User[]> {
  return model.ready.then(({ stmt }) => new Promise<User[]>((resolve, reject) => {
    stmt.selectAllUsers.all([], (error, users) => {
      if (error) {
        log.error('sqlite: getUsers', error.message);
        reject(error);
        return;
      }

      resolve(users as User[]);
    });
  }));
}
