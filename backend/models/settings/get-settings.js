const typify = require('../../utils/typify');
const dbReady = require('../index').ready;
const schema = require('./settings-schema');

let updatePromise;
let cachedSettings;
let cachedUntil = 0;

/**
 * Get an array of settings as returned from the database and return a typed map as { key: value }
 */
function settingsToObject(settingsArray) {
  const values = {};

  for (const item of settingsArray) {
    values[item.name] = item.value;
  }

  return typify(values, schema);
}

/**
 * Update the cached settings with values from the database
 */
function refreshSettings() {
  return dbReady.then(({ stmt }) => new Promise((resolve, reject) => {
    stmt.getSettings.all((error, rows) => {
      if (error) {
        reject(error);
        return;
      }

      cachedSettings = settingsToObject(rows);
      cachedUntil = new Date().getTime() + ((cachedSettings['settings.cache'] * 1000) || 0);

      resolve(cachedSettings);
    });
  }));
}

/**
 * Get all the settings or just the specified one
 */
function getSettings(name) {
  return new Promise((resolve, reject) => {
    const now = new Date().getTime();
    let promise = now < cachedUntil ? Promise.resolve(cachedSettings) : null;
    if (!promise) {
      if (!updatePromise) {
        updatePromise = refreshSettings();
      }
      promise = updatePromise;
    }

    promise.then((settings) => {
      updatePromise = null;
      resolve(name ? settings[name] : settings);
    }).catch(reject);
  });
}

/**
 * Mark the cached settings as invalid/old data to force a refresh next time is needed
 */
function invalidateCache() {
  cachedUntil = 0;
}

module.exports = {
  getSettings,
  invalidateCache,
};
