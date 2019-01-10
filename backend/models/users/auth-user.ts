import { User } from '../../../interfaces/model';
import { log } from '../../utils/log';
import { model } from '../index';

/**
 * Check if the specified user and pass matches
 * Resolves to the user info or undefined if the authentication fails
 */
export function authUser(username: string, password: string): Promise<User> {
  return model.ready.then(({ stmt }) => new Promise<User>((resolve, reject) => {
    stmt.authUser.get([username, password], (error, row) => {
      if (error) {
        log.error('sqlite', 'authUser');
        reject(error);
        return;
      }

      resolve(row as User);
    });
  }));
}
