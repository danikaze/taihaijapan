import { log } from '../../utils/log';
import { model } from '../index';

export function updateUser(id, data): Promise<void> {
  return model.ready.then(({ stmt }) => new Promise<void>((resolve, reject) => {
    const params = [
      data.username,
      data.password,
      '',
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
