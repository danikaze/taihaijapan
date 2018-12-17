const log = require('../utils/log');

const stmt = {};

function getConfig(config, name) {
  const s = config.filter((item) => item.name === name)[0];
  if (!s) {
    return undefined;
  }

  return s.value;
}

function getSqls() {
  return new Promise((resolve, reject) => {
    stmt.getConfig.all((error, config) => {
      if (error) {
        log.error('sqlite: getSqls.getConfig', error);
        reject(error);
        return;
      }

      const pageIndexLimit = getConfig(config, 'page.index.maxImages');
      const pageIndexSortField = getConfig(config, 'page.index.orderBy');
      const pageIndexSortDirection = getConfig(config, 'page.index.reverse') === 'true' ? 'DESC' : 'ASC';

      const pageGalleryLimit = getConfig(config, 'page.gallery.imagesPerPage');
      const pageGallerySortField = getConfig(config, 'page.gallery.orderBy');
      const pageGallerySortDirection = getConfig(config, 'page.gallery.reverse') === 'true' ? 'DESC' : 'ASC';

      const pageAdminLimit = getConfig(config, 'page.admin.imagesPerPage');
      const pageAdminSortField = getConfig(config, 'page.admin.orderBy');
      const pageAdminSortDirection = getConfig(config, 'page.admin.reverse') === 'true' ? 'DESC' : 'ASC';

      // list of STMTs that need to be updated with config values
      const sqls = {
        // photos
        getPhotosIndex: `SELECT id, title, slug
                          FROM photos
                          WHERE visible = 1
                          ORDER BY ${pageIndexSortField} ${pageIndexSortDirection}
                          LIMIT ${pageIndexLimit}
                          OFFSET ?;`,

        getPhotosPage: `SELECT id, title, slug, keywords
                        FROM photos
                        WHERE visible = 1
                        ORDER BY ${pageGallerySortField} ${pageGallerySortDirection}
                        LIMIT ${pageGalleryLimit}
                        OFFSET ?;`,

        getPhotosAdmin: `SELECT id, created, updated, title, slug, keywords, visible
                          FROM photos
                          ORDER BY ${pageAdminSortField} ${pageAdminSortDirection}
                          LIMIT ${pageAdminLimit}
                          OFFSET ?;`,
      };

      // list of constant STMTs
      if (!('updateSetting' in stmt)) {
        Object.assign(sqls, {
          // config
          updateSetting: 'UPDATE config SET value = ?, updated = (datetime("now", "utc")) WHERE name = ?;',
          // thumbnail sizes
          selectSizes: 'SELECT id, label, width, height FROM sizes ORDER BY width ASC;',
          insertSize: 'INSERT INTO sizes(label, width, height) VALUES(?, ?, ?);',
          updateSize: 'UPDATE sizes SET label = ?, width = ?, height = ? WHERE id = ?;',
          deleteSize: 'DELETE FROM sizes WHERE id = ?;',
          // tags
          insertTag: 'INSERT INTO tags(text) VALUES(?);',
          selectTag: 'SELECT id, text FROM tags WHERE text = ?;',
          selectTagsByPhoto: 'SELECT id, text FROM tags JOIN rel_photos_tags ON id = tag_id WHERE photo_id = ?',
          linkTag: 'INSERT INTO rel_photos_tags(photo_id, tag_id) VALUES(?, ?);',
          unlinkTag: 'DELETE FROM rel_photos_tags WHERE photo_id = ? AND tag_id = ?;',
          purgeTags: 'DELETE FROM tags WHERE id NOT IN (SELECT DISTINCT(tag_id) FROM rel_photos_tags);',
          // photos
          selectPhoto: `SELECT id, created, updated, original, slug, title, keywords, visible
                        FROM photos WHERE id = ?;`,
          insertPhoto: 'INSERT INTO photos(original, slug, title, keywords, visible) VALUES(?, ?, ?, ?, ?);',
          deletePhoto: 'DELETE FROM photos WHERE id = ?;',
          updatePhoto: `UPDATE photos
                        SET updated = (datetime("now", "utc")),
                            slug = ?,
                            title = ?,
                            keywords = ?,
                            visible = ?
                        WHERE id = ?`,
          // images
          getImagesByPhoto: 'SELECT src, width, height FROM images WHERE photo_id = ?;',
          getImageSrcs: 'SELECT src FROM images WHERE photo_id = ?;',
          insertImage: 'INSERT INTO images(photo_id, width, height, src) VALUES(?, ?, ?, ?);',
          // users
          authUser: 'SELECT id, username FROM users WHERE username = ? AND password = ?;',
          selectUsers: 'SELECT id, username, email, updated, created FROM users;',
          updateUser: `UPDATE users
                       SET updated = (datetime("now", "utc")),
                           username = ?,
                           password = ?,
                           email = ?
                       WHERE id = ?;`,
          deleteUser: 'DELETE FROM users WHERE id = ?;',
        });
      }

      resolve(sqls);
    });
  });
}

/**
 * getConfig is a bit special because it's used to create other SQLs, so it's prepared apart
 */
function prepareGetConfig(db) {
  return new Promise((resolve, reject) => {
    if (stmt.getConfig) {
      resolve();
      return;
    }

    const sql = 'SELECT * FROM config;';
    stmt.getConfig = db.prepare(sql, (error) => {
      if (error) {
        log.error('sqlite: preparing getConfig statement', error);
        reject(error);
        return;
      }
      resolve();
    });
  });
}

/**
 * Prepare the statements for the queries to use
 */
function prepareStatements(db) {
  return prepareGetConfig(db).then(() => getSqls().then((sqls) => {
    const keys = Object.keys(sqls);
    let left = keys.length;

    return new Promise((resolve, reject) => {
      function checkDone(key, sql, error) {
        if (error) {
          reject({ key, sql, error });
          return;
        }

        left--;
        if (left === 0) {
          log.info('sqlite', 'Statements ready');
          resolve(stmt);
        }
      }

      keys.forEach((key) => {
        const sql = sqls[key];
        const s = db.prepare(sql, checkDone.bind(null, key, sql));
        stmt[key] = s;
      });
    });
  })).catch((error) => {
    log.error('sqlite', `preparing statements ${JSON.stringify(error, null, 2)}`);
  });
}

module.exports = prepareStatements;
