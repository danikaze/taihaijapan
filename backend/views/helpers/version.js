const packageJsonVersion = require('../../../package.json').version;

function version() {
  return packageJsonVersion;
}

module.exports = {
  fn: version,
  asnyc: false,
};
