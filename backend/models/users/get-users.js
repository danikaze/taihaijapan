const log = require('../../utils/log');
const db = require('../index');

function getUsers() {
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

module.exports = getUsers;
