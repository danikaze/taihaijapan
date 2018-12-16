const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const log = require('../utils/log');
const prepareStatements = require('./prepare-statements');

let dbInstance;
const exportedData = {
  init,
  updateStatements,
};

/**
 * Initialize the database.
 * Needs to be called before anything else.
 *
 * @param {string} dbPath Path to the file to use as database
 */
function init(dbPath) {
  exportedData.ready = new Promise((resolve, reject) => {
    dbInstance = new sqlite3.Database(dbPath, (error) => {
      if (error) {
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
  return fs.readFileSync(file)
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

  fs.readdirSync(__dirname).forEach((file) => {
    const match = /\.(\d+)\.sql$/.exec(file);
    if (match) {
      const version = Number(match[1]);
      if (version > currentVersion) {
        list.push({
          version,
          fliename: file,
          sql: getSql(path.join(__dirname, file)),
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
function openDb() {
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

          const sql = getSql(path.join(__dirname, 'sql', 'default-data.sql'));
          log.info('sqlite', 'Inserting default data');
          db.exec(sql, (error) => {
            if (error) {
              reject(error);
              return;
            }
            resolve(db);
          });
        });
    });
  }

  return new Promise((resolve, reject) => {
    const sql = getSql(path.join(__dirname, 'sql', 'schema.sql'));

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
function updateStatements() {
  exportedData.ready.then(({ db }) => {
    exportedData.ready = new Promise((resolve, reject) => {
      prepareStatements(db).then(
        (stmt) => { resolve({ db, stmt }); },
        reject,
      );
    });
  });
}

/**
 * Opens the existing psql database file
 * If it doesn't exist, creates it
 * It applies any existing update based on the `schema.version` seting
 */
module.exports = exportedData;
