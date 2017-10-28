const path = require('path');
const EventEmitter = require('events');
const readJsonSync = require('../utils/readJsonSync');
const ctlEmitter = require('../ctl/ctlEmitter');

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
    this.data = readJsonSync(SETTINGS_PATH);
    this.emit('update');
  }
}

module.exports = new Settings();
