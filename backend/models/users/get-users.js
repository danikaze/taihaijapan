const db = require('../index');

function getUsers() {
  return db.ready.then(({ stmt }) => new Promise((resolve, reject) => {
    stmt.selectUsers.all([], (error, users) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(users);
    });
  }));
}

module.exports = getUsers;
