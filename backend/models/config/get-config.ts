import { log } from '../../utils/log';
import { typify } from '../../utils/typify';
import { default as db } from '../index';
import { Config } from '../interfaces';
import { schema } from '../schemas/config';

let updatePromise;
let cachedConfig: Config;
let cacheTtl = 0;
let cachedUntil = 0;

/**
 * Get an array of config as returned from the database and return a typed map as { key: value }
 */
function configToObject<T>(configArray): T {
  const values = {};

  for (const item of configArray) {
    values[item.name] = item.value;
  }

  return typify(values, schema) as T;
}

/**
 * Update the cached config with values from the database
 */
function refreshConfig(): Promise<Config> {
  return db.ready.then(({ stmt }) => new Promise<Config>((resolve, reject) => {
    stmt.getConfig.all((error, rows) => {
      if (error) {
        log.error('sqlite: refreshConfig', error);
        reject(error);
        return;
      }

      cachedConfig = configToObject<Config>(rows);
      cachedUntil = new Date().getTime() + cacheTtl;

      resolve(cachedConfig);
    });
  }));
}

/**
 * Get all the configuration values or just the specified one
 */
export function getConfig(): Promise<Config> {
  const now = new Date().getTime();
  let promise = now < cachedUntil ? Promise.resolve(cachedConfig) : null;
  if (!promise) {
    if (!updatePromise) {
      updatePromise = refreshConfig();
    }
    promise = updatePromise;
  }

  return promise.then((config) => {
    updatePromise = null;
    return config;
  })
}

/**
 * Mark the cached config as invalid/old data to force a refresh next time is needed
 */
export function invalidateCache() {
  cachedUntil = 0;
}

/**
 * Initialize the configuration module with the server settings
 */
export function init(ttl) {
  cacheTtl = Math.round(ttl) * 1000;
}
