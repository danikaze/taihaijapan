import { NewUser } from '../../../interfaces/model-ops';
import { log } from '../../utils/log';
import { model } from '../index';
import { hashPassword } from './hash-password';

/**
 * Get the salt of an existing user
 */
function getUserSalt(id: number): Promise<string> {
  return model.ready.then(({ stmt }) => new Promise<string>((resolve, reject) => {
    stmt.selectUserSalt.get([id], (error, user) => {
      if (error) {
        log.error('sqlite: getUserSalt', error.message);
        reject();
        return;
      }

      if (!user) {
        reject(`There's no user with id ${id}`);
        return;
      }

      resolve(user.salt);
    });
  }));
}

/**
 * Hash a new password for an existing user
 */
function hashNewPassword(userId: number, plainPassword: string): Promise<string> {
  return getUserSalt(userId).then((salt) => {
    return hashPassword(plainPassword, salt).then((password) => {
      return password.hash;
    });
  });
}

/**
 * Update the data of a registered user
 */
export function updateUser(id: number, data: NewUser): Promise<void> {
  return model.ready.then(({ stmt }) => new Promise<void>((resolve, reject) => {
    let params;
    let hashPromise: Promise<string>;
    let query: 'updateUser' | 'updateUserBasic';

    if (data.password) {
      hashPromise = hashNewPassword(id, data.password);
      query = 'updateUser';
      params = [
        data.username,
        undefined,
        data.email,
        data.lang,
        id,
      ];

    } else {
      hashPromise = Promise.resolve(undefined);
      query = 'updateUserBasic';
      params = [
        data.email,
        data.lang,
        id,
      ];
    }

    hashPromise.then((password) => {
      if (password) {
        params[1] = password;
      }

      stmt[query].run(params, (error) => {
        if (error) {
          log.error('sqlite: updateUser', error.message);
          reject(error);
          return;
        }
        resolve();
      });
    }).catch((error) => {
      log.error('updateUser', error);
    });
  }));
}
