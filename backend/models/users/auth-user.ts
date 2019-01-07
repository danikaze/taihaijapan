import { log } from '../../utils/log';
import { model } from '../index';

/**
 * Check if the specified user and pass matches
 * Resolves to the user info or undefined if the authentication fails
 *
 * @param username
 * @param password
 */
export function authUser(username: string, password: string) {
  return model.ready.then(({ stmt }) => new Promise((resolve, reject) => {
    stmt.authUser.get([username, password], (error, row) => {
      if (error) {
        log.error('sqlite', 'authUser');
        reject(error);
        return;
      }

      resolve(row);
    });
  }));
}
