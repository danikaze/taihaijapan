import { log } from '../../utils/log';
import { default as db } from '../index';

export function getUsers() {
  return db.ready.then(({ stmt }) => new Promise((resolve, reject) => {
    stmt.selectUsers.all([], (error, users) => {
      if (error) {
        log.error('sqlite: getUsers', error);
        reject(error);
        return;
      }

      resolve(users);
    });
  }));
}
