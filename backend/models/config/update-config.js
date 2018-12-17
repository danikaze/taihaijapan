const log = require('../../utils/log');
const db = require('../index');
const configSchema = require('../schemas/config');

/**
 * Get a string to store the value of a setting based on the schema
 */
function serialize(name, value) {
  return configSchema[name] === 'json' ? JSON.stringify(value) : String(value);
}

/**
 * Update the provided configuration in the database
 * TODO: Trigger an event to notify multiple server instances to invalidate the config cache
 */
function updateConfig(config) {
  return db.ready.then(({ stmt }) => new Promise((resolve, reject) => {
    const keys = Object.keys(config);
    let left = keys.length;

    function checkDone(error) {
      if (error) {
        log.error('sqlite: updateConfig', error);
        reject(error);
        return;
      }

      left--;
      if (left === 0) {
        resolve();
      }
    }

    keys.forEach((name) => {
      const value = serialize(name, config[name]);
      stmt.updateSetting.run([value, name], checkDone);
    });
  }));
}

module.exports = updateConfig;
