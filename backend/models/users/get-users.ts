import { log } from '../../utils/log';
import { model } from '../index';

export function getUsers() {
  return model.ready.then(({ stmt }) => new Promise((resolve, reject) => {
    stmt.selectUsers.all([], (error, users) => {
      if (error) {
        log.error('sqlite: getUsers', error.message);
        reject(error);
        return;
      }

      resolve(users);
    });
  }));
}
