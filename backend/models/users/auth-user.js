const log = require('../../utils/log');
const db = require('../index');

/**
 * Check if the specified user and pass matches
 * Resolves to the user info or undefined if the authentication fails
 *
 * @param {*} username
 * @param {*} password
 */
function authUser(username, password) {
  return db.ready.then(({ stmt }) => new Promise((resolve, reject) => {
    stmt.authUser.get([username, password], (error, row) => {
      if (error) {
        log.error('sqlite: authUser');
        reject(error);
        return;
      }

      resolve(row);
    });
  }));
}

module.exports = authUser;
