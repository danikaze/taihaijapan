/* eslint-disable */
const model = require('../backend/models');
const getConfig = require('../backend/models/config/get-config').getConfig;

/*
 * test
 */
model.ready.then(({ stmt }) => {
  stmt.insertTag.run(['tag1'], function cb1(error1) {
    console.log('tag1.id', this.lastID, error1);
    stmt.insertTag.run(['tag2'], function cb2(error2) {
      console.log('tag2.id', this.lastID, error2);
      stmt.insertTag.run(['tag1'], function cb3(error3) {
        console.log('tag1.id', this.lastID, error3);
      });
    });
  });

  getConfig().then((settings) => {
    console.log('schema.versions', settings['schema.version']);
  });
});
