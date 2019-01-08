const resolve = require('path').resolve;
const join = require('path').join;

/**
 * Return an absolute path from a route relative to the project root
 */
function getAbsPath(path) {
  return resolve(join(__dirname, '..', '..', path));
}

module.exports = {
  getAbsPath,
};
