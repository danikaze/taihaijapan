const path = require('path');
const EventEmitter = require('events');
const readJsonSync = require('../utils/readJsonSync');
const ctlEmitter = require('../ctl/ctlEmitter');

const GALLERY_PATH = path.resolve(__dirname, '../data/gallery.json');

class Settings extends EventEmitter {
  constructor() {
    super();

    ctlEmitter.on('command.reloadGallery', () => {
      this.load();
    });

    this.load();
  }

  load() {
    this.data = readJsonSync(GALLERY_PATH);
    this.emit('update');
  }
}

module.exports = new Settings();
