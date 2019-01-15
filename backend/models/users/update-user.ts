import { NewUser } from '../../../interfaces/model-ops';
import { log } from '../../utils/log';
import { model } from '../index';

/**
 * Update the data of a registered user
 */
export function updateUser(id: number, data: NewUser): Promise<void> {
  return model.ready.then(({ stmt }) => new Promise<void>((resolve, reject) => {
    const params = [
      data.username,
      data.password,
      '',
      data.lang,
      id,
    ];

    stmt.updateUser.run(params, (error) => {
      if (error) {
        log.error('sqlite: updateUser', error.message);
        reject(error);
        return;
      }
      resolve();
    });
  }));
}
