/* eslint-disable no-console */
const colors = require('colors/safe');

const LEVEL_INFO = 1;
const LEVEL_LOG = 0;
const LEVEL_ERROR = -1;

class Output {
  constructor(level) {
    this.level = level;
  }

  info(msg) {
    if (this.level > LEVEL_INFO) {
      console.log(colors.grey(msg));
    }
  }

  log(msg) {
    if (this.level > LEVEL_LOG) {
      console.log(msg);
    }
  }

  error(msg) {
    if (this.level > LEVEL_ERROR) {
      console.log(colors.red(msg));
    }
  }
}

module.exports = Output;
