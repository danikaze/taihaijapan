import { NewUser } from '../../../interfaces/model-ops';
import { model } from '..';
import { log } from '../../utils/log';
import { hashPassword } from './hash-password';

/**
 * Create a new user
 */
export function addUser(user: NewUser): Promise<number> {
  return model.ready.then(({ stmt }) => new Promise<number>((resolve, reject) => {
    hashPassword(user.password).then((password) => {
      // insert the new user into the database
      const params = [
        user.username,
        password.hash,
        user.email || '',
        user.lang,
        password.salt,
      ];
      stmt.insertUser.run(params, function callback(error) {
        if (error) {
          log.error('addUser', error.message);
          reject(error);
          return;
        }

        log.info('addUser', `User ${this.lastID} created`);
        resolve(this.lastID);
      });
    }).catch(() => {
      log.error('addUser', `Error hashing the password for the user ${user.username}`);
    });
  }));
}
