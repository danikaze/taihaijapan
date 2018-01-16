const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');
const extend = require('extend');
const Validator = require('bulk-validator').Validator;
const readJsonSync = require('../utils/readJsonSync');
const ctlEmitter = require('../ctl/ctlEmitter');
const log = require('../utils/log');

const DEFAULT_SETTINGS_PATH = path.resolve(__dirname, '../data/settings.default.json');
const SETTINGS_PATH = path.resolve(__dirname, '../data/settings.json');

function getValidator() {
  const v = new Validator({
    optional: true,
    returnUndefined: false,
  });

  v.addAlias('gez', 'num', { // greater or equal than zero
    alias: 'positiveInt',
    validator: 'num',
    options: {
      integer: true,
      rangeMin: 1,
      minEq: true,
    },
  });

  v.addValidator('imageSize', (data, options) => ({
    data: {
      id: data.id,
      w: parseInt(data.w, 10),
      h: parseInt(data.h, 10),
    },
    valid: data &&
            typeof data.id === 'string' &&
            !isNaN(data.w) &&
            !isNaN(data.h),
  }));

  v.addValidator('imagesResizeFormatOptions', (data, options) => ({
    data: {
      quality: parseInt(data.quality, 10),
    },
    valid: data && !isNaN(data.quality),
  }));

  v.addSchema('global', {
    title: { validator: 'str' },
    user: { validator: 'str' },
    password: { validator: 'str' },
  });

  v.addSchema('controllers.admin', {
    route: { validator: 'str' },
    imagesPerPage: { validator: 'gez' },
    sortBy: { validator: 'str' },
    reverse: { validator: 'bool' },
  });

  v.addSchema('controllers.index', {
    maxImages: { validator: 'gez' },
    sortBy: { validator: 'str' },
    reverse: { validator: 'bool' },
  });

  v.addSchema('controllers.gallery', {
    maxImages: { validator: 'gez' },
    sortBy: { validator: 'str' },
    reverse: { validator: 'bool' },
  });

  v.addSchema('images', {
    originalPath: { validator: 'str' },
    temporalPath: { validator: 'str' },
    path: { validator: 'str' },
    baseUrl: { validator: 'str' },
    hiddenByDefault: { validator: 'bool' },
    sizes: { validator: 'imageSizeArray' },
  });

  v.addSchema('images.resize', {
    resizePolicy: { validator: 'str' },
    outputFile: { validator: 'str' },
    format: { validator: 'str' },
    formatOptions: { validator: 'imagesResizeFormatOptions' },
  });

  return v;
}

class Settings extends EventEmitter {
  constructor() {
    super();

    ctlEmitter.on('command.reloadSettings', () => {
      this.load();
    });

    this.load();
    this.validator = getValidator();
  }

  /**
   * Sanitices the data of a photo that can come from user entry
   *
   * @param {object} data
   * @return {object} copy of the saniticed object, with only the used properties
   */
  saniticePublicData(data) {
    const validator = this.validator;
    const sanitizedData = {
      controllers: {},
    };
    const errors = {
      controllers: {},
      images: {},
    };
    let ok = true;

    function check(schema, checkData, property, sanitizedParent, errorParent) {
      validator.schema(schema, checkData);
      sanitizedParent[property] = validator.valid();
      const e = validator.errors();
      if (e) {
        ok = false;
        Object.assign(errorParent[property], e);
      }
    }

    check('global', data.global, 'global', sanitizedData, errors);
    check('controllers.admin', data.controllers.admin, 'admin', sanitizedData.controllers, errors.controllers);
    check('controllers.index', data.controllers.index, 'index', sanitizedData.controllers, errors.controllers);
    check('controllers.gallery', data.controllers.gallery, 'gallery', sanitizedData.controllers, errors.controllers);
    check('images', data.images, 'images', sanitizedData, errors);
    check('images.resize', data.images.resize, 'resize', sanitizedData.images, errors.images);

    return {
      data: sanitizedData,
      errors,
      ok,
    };
  }

  save(now) {
    this.data.updated = now || new Date().toISOString();
    return new Promise((resolve, reject) => {
      fs.writeFile(SETTINGS_PATH, JSON.stringify(this.data, null, 2), 'utf8', (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  load() {
    let defaultSettings;
    let userSettings;

    try {
      defaultSettings = readJsonSync(DEFAULT_SETTINGS_PATH);
    } catch (error) {
      log.error('SettingsModel', `Error reading default settings: ${error}`);
      process.exit(-1);
    }

    try {
      userSettings = readJsonSync(SETTINGS_PATH);
    } catch (error) {
      log.warn('SettingsModel', `Error reading user settings: ${error}`);
    }

    this.data = Object.assign(defaultSettings, userSettings);
    this.emit('update');
  }

  update(options) {
    const self = this;

    if (options && options.global && !options.global.password) {
      delete options.global.password;
    }

    return new Promise((resolve, reject) => {
      const res = this.saniticePublicData(options);

      if (!res.ok) {
        reject(res.errors());
        return;
      }

      extend(true, self.data, res.data);

      self.save()
        .then(() => {
          this.emit('update');
          resolve();
        })
        .catch(reject);
    });
  }
}

module.exports = new Settings();
