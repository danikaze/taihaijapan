const log = require('../../utils/log');
const db = require('../index');

function updateUser(id, data) {
  return db.ready.then(({ stmt }) => new Promise((resolve, reject) => {
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

module.exports = updateUser;
