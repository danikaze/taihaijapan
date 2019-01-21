import { NewUser } from '../../../interfaces/model-ops';
import { log } from '../../utils/log';
import { model } from '../index';
import { hashPassword } from './hash-password';

/**
 * Update the data of a registered user
 */
export function updateUser(id: number, data: NewUser): Promise<void> {
  return model.ready.then(({ stmt }) => new Promise<void>((resolve, reject) => {
    let params;
    let hashPromise: Promise<string>;
    let query: 'updateUser' | 'updateUserBasic';

    if (data.password) {
      hashPromise = hashPassword(data.password);
      query = 'updateUser';
      params = [
        data.username,
        undefined, // password, to be replaced when the hash is resolved
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
