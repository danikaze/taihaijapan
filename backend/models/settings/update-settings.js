const dbReady = require('../index').ready;
const schema = require('./settings-schema');

/**
 * Get a string to store the value of a setting based on the schema
 */
function serialize(name, value) {
  return schema[name] === 'json' ? JSON.stringify(value) : String(value);
}

/**
 * Update the provided settings in the database
 * TODO: Trigger an event to notify multiple server instances to invalidate the settings cache
 */
function updateSettings(settings) {
  return dbReady(({ stmt }) => new Promise((resolve, reject) => {
    const keys = Object.keys(settings);
    let left = keys.length;

    function checkDone(error) {
      if (error) {
        reject(error);
        return;
      }

      left--;
      if (left === 0) {
        resolve();
      }
    }

    keys.forEach((name) => {
      const value = serialize(name, settings[name]);
      stmt.updateSetting.run([value, name], checkDone);
    });
  }));
}

module.exports = updateSettings;
