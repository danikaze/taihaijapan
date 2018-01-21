const path = require('path');
const fs = require('fs');
const EventEmitter = require('events');
const mkdirp = require('mkdirp').sync;
const Validator = require('bulk-validator').Validator;
const readJsonSync = require('../utils/readJsonSync');
const ctlEmitter = require('../ctl/ctlEmitter');
const settingsModel = require('../models/settings');
const log = require('../utils/log');
const generateFileName = require('../utils/generateFileName');
const resizeImage = require('../utils/resizeImage');
const noop = require('../utils/noop');

let settings;

function updateSettings() {
  settings = settingsModel.data.images;
}

const GALLERY_PATH = path.resolve(__dirname, '../data/gallery.json');

function getValidator() {
  const v = new Validator();
  v.addAlias('date', 'str', { regExp: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/ });
  v.addAlias('tag', 'str', { regExp: /[-A-Za-z0-9]+/ });

  v.addValidator('slug', (data, options) => ({
    data,
    valid: /[-A-Za-z0-9]+/.test(data),
  }));

  v.addSchema('new', {
    title: {
      validator: 'str',
      options: { defaultValue: '' },
    },
    original: {
      validator: 'str',
      options: { optional: false },
    },
    slug: {
      validator: 'slug',
      options: { optional: false },
    },
    tags: {
      validator: 'tagArray',
      options: { defaultValue: [] },
    },
    keywords: {
      validator: 'str',
      options: { defaultValue: '' },
    },
    deleted: {
      validator: 'bool',
      options: { defaultValue: undefined },
    },
  }, {
    optional: true,
  });

  v.addSchema('update', {
    title: {
      validator: 'str',
    },
    original: {
      validator: 'str',
    },
    slug: {
      validator: 'slug',
    },
    tags: {
      validator: 'tagArray',
    },
    keywords: {
      validator: 'str',
    },
    deleted: {
      validator: 'bool',
    },
  }, {
    optional: true,
    returnUndefined: false,
  });

  return v;
}

function getSorterFunction(sortBy, reverse) {
  return function sorter(a, b) {
    const fieldA = a[sortBy];
    const fieldB = b[sortBy];
    let res;

    if (typeof fieldA === 'string') {
      res = fieldA.localeCompare(fieldB);
    } else {
      res = b[sortBy] - a[sortBy];
    }

    if (reverse) {
      res *= -1;
    }

    return res;
  };
}

/**
 * Get the minimum data necesary for the gallery model
 */
function getBaseData() {
  const now = new Date().toISOString();

  return {
    created: now,
    updated: now,
    nextId: 1,
    photos: [],
  };
}

/**
 * Get a photo data with the path to the original image, and create thumbnails resizing and
 * storing them in the adecuate folders, returning a Promise resolved to an array of thumbnail data
 * @param {object} data
 * @returns {Promise<Array<object>>}
 */
function createThumbnails(data) {
  return new Promise((resolve, reject) => {
    const thumbs = [];
    let remainingSizes = settings.sizes.length;

    settings.sizes.forEach((size, sizeIndex) => {
      const tempNameTemplate = path.resolve(__dirname, '..',
        `${settings.temporalPath}/{random}${path.extname(data.original)}`);
      generateFileName(tempNameTemplate, data.original).then((resizeTargetPath) => {
        resizeImage(data.original, resizeTargetPath, size.w, size.h, settings.resize)
          .then((thumbInfo) => {
            const replaceValues = {
              id: data.id,
              slug: data.slug,
              sizeId: size.id,
            };
            generateFileName(settings.resize.outputFile, thumbInfo.path, replaceValues)
            .then((outputFile) => {
              const outputPath = path.resolve(__dirname, '..', path.join(settings.path, outputFile));
              const outputFolder = path.dirname(outputPath);
              if (!fs.existsSync(outputFolder)) {
                mkdirp(outputFolder);
              }

              fs.renameSync(resizeTargetPath, outputPath);
              thumbs[sizeIndex] = {
                w: thumbInfo.width,
                h: thumbInfo.height,
                src: path.join(settings.baseUrl, outputFile),
              };

              remainingSizes--;
              if (remainingSizes === 0) {
                resolve(thumbs);
              }
            });
          });
      });
    });
  });
}

class Gallery extends EventEmitter {
  constructor() {
    super();

    ctlEmitter.on('command.reloadGallery', () => {
      this.load();
    });

    this.load();
    this.validator = getValidator();
  }

  /**
   * Check if `elem` is unique
   *
   * @param  {object}  elem
   * @param  {number}  [id]
   * @return {boolean}      `true` if unique, `false` if not unique
   */
  checkUnique(elem, id) {
    // eslint-disable-next-line eqeqeq
    const repeated = this.data.photos.filter((item) => item.slug === elem.slug && item.id != id);

    return repeated.length === 0;
  }

  /**
   * Sanitices the data of a photo that can come from user entry
   *
   * @param {object} data
   * @return {object} copy of the saniticed object, with only the used properties
   */
  saniticePublicData(data, schema) {
    if (typeof data.tags === 'string') {
      data.tags = data.tags.split(',')
                          .map((tag) => tag.trim())
                          .filter((str) => str.length);
    }

    if (data.keywords) {
      data.keywords = data.keywords.split(',')
                                  .map((keyword) => keyword.trim())
                                  .filter((str) => str.length)
                                  .join(', ');
    }

    this.validator.schema(schema, data);

    return this.validator;
  }

  load() {
    this.data = getBaseData();
    try {
      this.data = Object.assign(this.data, readJsonSync(GALLERY_PATH));
    } catch (error) {
      log.error('GalleryModel', 'Error reading gallery data. Initializating with default one.');
      this.save(this.data.created);
    }
    this.emit('update');
  }

  save(now) {
    this.data.updated = now || new Date().toISOString();
    return new Promise((resolve, reject) => {
      fs.writeFile(GALLERY_PATH, JSON.stringify(this.data, null, 2), 'utf8', (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   *
   * @param {object} options `{ n, sortBy, reverse, filter, deleted, secure }`
   */
  getPhotos(options = {}) {
    let res;

    if (!options.deleted && !options.filter) {
      res = this.data.photos.filter((item) => !item.deleted);
    } else if (!options.deleted && options.filter) {
      res = this.data.photos.filter((item) => !item.deleted && options.filter(item));
    } else if (options.deleted && !options.filter) {
      res = this.data.photos;
    } else {
      res = this.data.photos.filter((item) => options.filter(item));
    }

    if (options.n) {
      res = res.slice(0, options.n);
    }

    if (options.sortBy) {
      res.sort(getSorterFunction(options.sortBy, options.reverse));
    }

    if (options.secure === false) {
      return res;
    }

    const secureRes = [];

    res.forEach((photo) => {
      secureRes.push({
        id: photo.id,
        keywords: photo.keywords,
        tags: photo.tags,
        title: photo.title,
        slug: photo.slug,
        deleted: photo.deleted,
        imgs: photo.imgs,
      });
    });

    return secureRes;
  }

  /**
   *
   * @param {object} photo
   */
  add(photo) {
    const self = this;
    return new Promise((resolve, reject) => {
      const now = new Date().toISOString();
      const validation = this.saniticePublicData(photo, 'new');

      if (validation.errors()) {
        reject(validation.errors());
        return;
      }

      const data = Object.assign({
        id: self.data.nextId,
        keywords: '',
        tags: [],
        added: now,
        updated: now,
      }, validation.valid());

      if (!this.checkUnique(data)) {
        reject({ slug: 'must be unique' });
        return;
      }

      if (data.deleted === undefined) {
        data.deleted = settings.hiddenByDefault;
      }

      self.data.nextId++;

      createThumbnails(data).then((imageData) => {
        data.imgs = imageData;
        self.data.photos.unshift(data);
        self.save(now)
          .then(() => {
            this.emit('update');
            resolve();
          })
          .catch(reject);
      });
    });
  }

  /**
   *
   *
   * @param {object} newData Data as `{ id: data }`
   */
  update(newData) {
    return new Promise((resolve, reject) => {
      const now = new Date().toISOString();
      const updatedData = {};

      Object.keys(newData).forEach((id) => {
        const validation = this.saniticePublicData(newData[id], 'update');

        if (validation.errors()) {
          reject(validation.errors());
          return;
        }

        const photo = this.get(id);
        if (!photo) {
          reject('id not found');
          return;
        }

        const data = validation.valid();

        if (!this.checkUnique(data, id)) {
          reject({ slug: 'must be unique' });
          return;
        }

        data.updated = now;
        updatedData[id] = data;

        Object.assign(photo, data);
      });

      this.save(now).then(() => {
        this.emit('update');
        resolve(updatedData);
      });
    });
  }

  /**
   *
   * @param {number[]} ids list of ids of the photos to fully remove
   */
  remove(ids) {
    return new Promise((resolve, reject) => {
      const filesToRemove = [];
      const indexes = ids.map((id) => this.data.photos.findIndex((photo) => photo.id === parseInt(id, 10)));

      // get the files to remove while updating the json
      indexes.sort().reverse().forEach((index) => {
        if (index !== -1) {
          const photo = this.data.photos[index];
          filesToRemove.push(photo.original);
          photo.imgs.forEach((img) => {
            filesToRemove.push(path.join(__dirname, '..', img.src));
          });
          this.data.photos.splice(index, 1);
        }
      });

      // update the json and send the response
      this.save().then(() => {
        this.emit('update');
        resolve({
          photos: ids,
        });
      });

      // leave the file removal task to the background
      filesToRemove.forEach((file) => {
        fs.unlink(file, noop);
      });
    });
  }

  get(id) {
    id = parseInt(id, 10);
    const index = this.data.photos.findIndex((item) => item.id === id);
    return this.data.photos[index];
  }
}

settingsModel.on('update', updateSettings);
updateSettings();

module.exports = new Gallery();
