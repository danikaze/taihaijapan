import * as sqlite3 from "sqlite3";
import { existsSync, readFileSync, readdirSync } from 'fs';
import { sync as mkdirp } from 'mkdirp';
import { join, dirname } from 'path';

import { log } from '../utils/log';
import { prepareStatements } from './prepare-statements';

export interface Model {
  ready: Promise<{ stmt, db }>;
  instance: any;
  init: (settings) => Promise<{ stmt, db }>;
  updateStatements: () => Promise<{ stmt, db }>;
}

const exportedData: Model = {
  ready: undefined,
  instance: undefined,
  init,
  updateStatements,
};

let sqlite = sqlite3;
let dbInstance: sqlite3.Database;

/**
 * Initialize the database.
 * Needs to be called before anything else.
 *
 * @param {string} dbPath Path to the file to use as database
 */
export function init(settings) {
  if (settings.db.debugMode) {
    sqlite = sqlite.verbose();
  }

  const dbFolder = dirname(settings.db.path);
  if (!existsSync(dbFolder)) {
    mkdirp(dbFolder);
  }

  exportedData.ready = new Promise((resolve, reject) => {
    dbInstance = new sqlite.Database(settings.db.path, (error) => {
      if (error) {
        log.error('sqlite: error opening the database', JSON.stringify(error, null, 2));
        reject(error);
        return;
      }

      openDb()
        .then((data) => {
          exportedData.instance = data.db;
          resolve(data);
        }, reject);
    });
  });

  return exportedData.ready;
}

/**
 * Return SQL code to execute from a file without the comments, to avoid runtime problems
 *
 * @param file Path to the file with SQL code
 */
function getSql(file) {
  return readFileSync(file)
    .toString()
    .replace(/-- .*\n/gm, '');
}

/**
 * Get the list of file paths to apply to the schema
 *
 * @param currentVersion only updates with a higher version than this will be returned
 */
function getUpdateFiles(currentVersion) {
  const list = [];

  readdirSync(__dirname).forEach((file) => {
    const match = /\.(\d+)\.sql$/.exec(file);
    if (match) {
      const version = Number(match[1]);
      if (version > currentVersion) {
        list.push({
          version,
          fliename: file,
          sql: getSql(join(__dirname, file)),
        });
      }
    }
  });

  list.sort((a, b) => a.version - b.version);

  return list;
}

/**
 * Retrieve the current schema version, stored in the db
 */
function getCurrentSchemaVersion(db) {
  return new Promise((resolve) => {
    const getVersionSql = 'SELECT value FROM config WHERE name = ?';
    db.get(getVersionSql, ['schema.version'], (err, row) => {
      const currentVersion = row && Number(row.value);
      resolve(currentVersion);
    });
  });
}

/**
 * Apply all the found updates (files in this directory ending with `{.versionNumber}.sql`)
 * updating the `schema.version` sequentially
 */
function applyUpdates(db) {
  return new Promise((resolve) => {
    let updates;
    let appliedUpdates = 0;

    function checkResolve() {
      appliedUpdates++;
      if (appliedUpdates === updates.length) {
        resolve(db);
      }
    }

    getCurrentSchemaVersion(db).then((currentVersion) => {
      updates = getUpdateFiles(currentVersion).filter((update) => update.version > currentVersion);

      if (updates.length === 0) {
        resolve(db);
        return;
      }

      db.serialize(() => {
        for (const update of updates) {
          const sql = `${update.sql}
            UPDATE settings SET
              value = ${update.version},
              updated = (datetime('now', 'utc'))
            WHERE name = "schema.version";
          `;
          log.info('sqlite', `Applying update ${update.filename}`);
          db.exec(sql, checkResolve);
        }
      });
    });
  });
}

/**
 * Try to open the database. If it doesn't exist, create it.
 * If it's not the latest version, apply the updates.
 */
function openDb(): Promise<{ db, stmt }> {
  /**
   * If the DB was just created, initialize it with `schema.version = 0` and default data
   */
  function initDb(db) {
    return new Promise((resolve, reject) => {
      getCurrentSchemaVersion(db)
        .then((version) => {
          if (version !== undefined) {
            resolve(db);
            return;
          }

          const sql = getSql(join(__dirname, 'sql', 'default-data.sql'));
          log.info('sqlite', 'Inserting default data');
          db.exec(sql, (error) => {
            if (error) {
              log.error('sqlite: insert default data', error);
              reject(error);
              return;
            }
            resolve(db);
          });
        });
    });
  }

  return new Promise<{ db, stmt }>((resolve, reject) => {
    const sql = getSql(join(__dirname, 'sql', 'schema.sql'));

    dbInstance.exec(sql, (error) => {
      if (error) {
        reject(error);
        return;
      }

      initDb(dbInstance)
        .then(applyUpdates)
        .then(prepareStatements)
        .then((stmt) => {
          log.info('sqlite', 'Database ready');
          resolve({ db: dbInstance, stmt });
        })
        .catch(reject);
    });
  });
}

/**
 * Update the database prepared statements and the `ready` value to resolve to the new ones
 */
export function updateStatements(): Promise<{ stmt, db }> {
  const promise = new Promise<{ stmt, db }>((resolve, reject) => {
    exportedData.ready.then(({ db }) => {
      exportedData.ready = promise;
      prepareStatements(db).then(
        (stmt) => { resolve({ db, stmt }); },
        reject,
      );
    });
  });

  return promise;
}

/**
 * Opens the existing psql database file
 * If it doesn't exist, creates it
 * It applies any existing update based on the `schema.version` seting
 */
export default exportedData;