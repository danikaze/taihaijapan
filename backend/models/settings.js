const path = require('path');
const EventEmitter = require('events');
const readJsonSync = require('../utils/readJsonSync');
const ctlEmitter = require('../ctl/ctlEmitter');
const log = require('../utils/log');

const DEFAULT_SETTINGS_PATH = path.resolve(__dirname, '../data/settings.default.json');
const SETTINGS_PATH = path.resolve(__dirname, '../data/settings.json');

class Settings extends EventEmitter {
  constructor() {
    super();

    ctlEmitter.on('command.reloadSettings', () => {
      this.load();
    });

    this.load();
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
    this.fixPaths();

    this.emit('update');
  }

  fixPaths() {
    this.data.images.originalPath = path.resolve(__dirname, '..', this.data.images.originalPath);
    this.data.images.temporalPath = path.resolve(__dirname, '..', this.data.images.temporalPath);
    this.data.images.path = path.resolve(__dirname, '..', this.data.images.path);
  }
}

module.exports = new Settings();
