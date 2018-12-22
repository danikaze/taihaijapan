const log = require('../../utils/log');
const typify = require('../../utils/typify');
const db = require('../');
const configSchema = require('../schemas/config');

let updatePromise;
let cachedConfig;
let cacheTtl = 0;
let cachedUntil = 0;

/**
 * Get an array of config as returned from the database and return a typed map as { key: value }
 */
function configToObject(configArray) {
  const values = {};

  for (const item of configArray) {
    values[item.name] = item.value;
  }

  return typify(values, configSchema);
}

/**
 * Update the cached config with values from the database
 */
function refreshConfig() {
  return db.ready.then(({ stmt }) => new Promise((resolve, reject) => {
    stmt.getConfig.all((error, rows) => {
      if (error) {
        log.error('sqlite: refreshConfig', error);
        reject(error);
        return;
      }

      cachedConfig = configToObject(rows);
      cachedUntil = new Date().getTime() + cacheTtl;

      resolve(cachedConfig);
    });
  }));
}

/**
 * Get all the configuration values or just the specified one
 */
function getConfig(name) {
  return new Promise((resolve, reject) => {
    const now = new Date().getTime();
    let promise = now < cachedUntil ? Promise.resolve(cachedConfig) : null;
    if (!promise) {
      if (!updatePromise) {
        updatePromise = refreshConfig();
      }
      promise = updatePromise;
    }

    promise.then((config) => {
      updatePromise = null;
      resolve(name ? config[name] : config);
    }).catch(reject);
  });
}

/**
 * Mark the cached config as invalid/old data to force a refresh next time is needed
 */
function invalidateCache() {
  cachedUntil = 0;
}

/**
 * Initialize the configuration module with the server settings
 */
function init(ttl) {
  cacheTtl = Math.round(ttl) * 1000;
}

module.exports = {
  getConfig,
  invalidateCache,
  init,
};
