import { log } from '../../utils/log';
import { default as db } from '../index';

export function updateUser(id, data): Promise<void> {
  return db.ready.then(({ stmt }) => new Promise<void>((resolve, reject) => {
    const params = [
      data.username,
      data.password,
      '',
      id,
    ];

    stmt.updateUser.run(params, (error) => {
      if (error) {
        log.error('sqlite: updateUser', error);
        reject(error);
        return;
      }
      resolve();
    });
  }));
}
