import { compare } from 'bcrypt';
import { User } from '../../../interfaces/model';
import { log } from '../../utils/log';
import { model } from '../index';

/**
 * Check if the specified user and pass matches
 * Resolves to the user info or undefined if the authentication fails
 *
 * @param username username to check
 * @param password username password in plain text
 */
export function authUser(username: string, password: string): Promise<User> {
  return model.ready.then(({ stmt }) => new Promise<User>((resolve, reject) => {
    stmt.selectUserByName.get([username], (error, user) => {
      if (error) {
        log.error('sqlite: authUser', error.message);
        reject(error);
        return;
      }

      if (!user) {
        reject('User doesn\'t exit');
        return;
      }

      compare(password, user.password).then((equals) => {
        if (equals) {
          resolve(user as User);
          return;
        }
        reject('Password doesn\'t match');
      });
    });
  }));
}
