import * as sqlite3 from 'sqlite3';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { sync as mkdirp } from 'mkdirp';
import { join, dirname } from 'path';

import { PATH_MODEL_INIT, PATH_MODEL_UPDATES } from '../../constants/paths';
import { log } from '../utils/log';
import { Settings, InitialUserSettings } from '../settings';
import { prepareStatements, Statements } from './prepare-statements';
import { hashPassword } from './users/hash-password';

export interface DbReady {
  db: sqlite3.Database;
  stmt: Statements;
}

export interface Model {
  ready: Promise<DbReady>;
  instance: sqlite3.Database;
  init: (settings: Settings) => Promise<DbReady>;
  updateStatements: () => Promise<DbReady>;
}

interface UpdateData {
  version: number;
  filename: string;
  sql: string;
}

const exportedData: Model = {
  init,
  updateStatements,
  ready: undefined,
  instance: undefined,
};

let sqlite = sqlite3;
let dbInstance: sqlite3.Database;

/**
 * Initialize the database.
 * Needs to be called before anything else.
 *
 * @param dbPath Path to the file to use as database
 */
export function init(settings: Settings): Promise<DbReady> {
  if (settings.db.debugMode) {
    sqlite = sqlite.verbose();
  }

  const dbFolder = dirname(settings.db.path);
  if (!existsSync(dbFolder)) {
    mkdirp(dbFolder);
  }

  exportedData.ready = new Promise<DbReady>((resolve, reject) => {
    dbInstance = new sqlite.Database(settings.db.path, (error) => {
      if (error) {
        log.error('sqlite: error opening the database', JSON.stringify(error, null, 2));
        reject(error);
        return;
      }

      openDb(settings.initialUser)
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
function getSql(file: string): string {
  return readFileSync(file)
    .toString()
    .replace(/-- .*\n/gm, '');
}

/**
 * Get the list of file paths to apply to the schema
 *
 * @param currentVersion only updates with a higher version than this will be returned
 */
function getSqlUpdateFiles(currentVersion: number): UpdateData[] {
  const list: UpdateData[] = [];

  if (!existsSync(PATH_MODEL_UPDATES)) {
    return list;
  }

  readdirSync(PATH_MODEL_UPDATES).forEach((file) => {
    const match = /\.(\d+)\.sql$/.exec(file);
    if (!match) {
      return;
    }

    const version = Number(match[1]);
    if (version <= currentVersion) {
      return;
    }
    list.push({
      version,
      filename: file,
      sql: getSql(join(__dirname, file)),
    });
  });

  list.sort((a, b) => a.version - b.version);

  return list;
}

/**
 * Retrieve the current schema version, stored in the db
 */
function getCurrentSchemaVersion(db: sqlite3.Database): Promise<number> {
  return new Promise<number>((resolve) => {
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
function applyUpdates(db: sqlite3.Database): Promise<sqlite3.Database> {
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
      updates = getSqlUpdateFiles(currentVersion).filter((update) => update.version > currentVersion);

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
function openDb(initialUser: InitialUserSettings): Promise<DbReady> {
  /**
   * If the DB was just created, initialize it with `schema.version = 0` and default data
   */
  function initDb(db: sqlite3.Database): Promise<sqlite3.Database> {
    return new Promise<sqlite3.Database>((resolve, reject) => {
      getCurrentSchemaVersion(db)
        .then((version) => {
          if (version !== undefined) {
            resolve(db);
            return;
          }

          const sql = getSql(join(PATH_MODEL_INIT, 'default-data.sql'));
          log.info('sqlite', 'Inserting default data');
          db.exec(sql, (error) => {
            if (error) {
              log.error('sqlite: insert default data', error.message);
              reject(error);
              return;
            }
            createInitialUser(db).then(resolve, reject);
          });
        });
    });
  }

  /**
   * Insert the initial db in the database
   */
  function createInitialUser(db: sqlite3.Database): Promise<sqlite3.Database> {
    return new Promise<sqlite3.Database>((resolve, reject) => {
      hashPassword(initialUser.password).then((hashedPassword) => {
        const sql = 'INSERT INTO users(username, password, email, lang) VALUES(?, ?, ?, ?);';
        const params = [
          initialUser.username,
          hashedPassword,
          initialUser.email,
          initialUser.lang,
        ];
        log.info('sqlite', 'Inserting initial user');
        db.run(sql, params, (error) => {
          if (error) {
            log.error('sqlite: insert initial user', error.message);
            reject(error);
            return;
          }
          resolve(db);
        });
      }).catch(() => {
        log.error('createInitialUser', 'Error hashing initial password');
      });
    });
  }

  return new Promise<DbReady>((resolve, reject) => {
    const sql = getSql(join(PATH_MODEL_INIT, 'schema.sql'));

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
          resolve({ stmt, db: dbInstance });
        })
        .catch(reject);
    });
  });
}

/**
 * Update the database prepared statements and the `ready` value to resolve to the new ones
 */
export function updateStatements(): Promise<DbReady> {
  const promise = new Promise<DbReady>((resolve, reject) => {
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
export {
  exportedData as model,
};
