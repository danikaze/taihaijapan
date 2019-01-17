import { NewUser } from '../../../interfaces/model-ops';
import { log } from '../../utils/log';
import { model } from '../index';

/**
 * Update the data of a registered user
 */
export function updateUser(id: number, data: NewUser): Promise<void> {
  return model.ready.then(({ stmt }) => new Promise<void>((resolve, reject) => {
    let params;
    let query: 'updateUser' | 'updateUserBasic';

    if (data.password) {
      query = 'updateUser';
      params = [
        data.username,
        data.password,
        data.email,
        data.lang,
        id,
      ];

    } else {
      query = 'updateUserBasic';
      params = [
        data.email,
        data.lang,
        id,
      ];
    }

    stmt[query].run(params, (error) => {
      if (error) {
        log.error('sqlite: updateUser', error.message);
        reject(error);
        return;
      }
      resolve();
    });
  }));
}
