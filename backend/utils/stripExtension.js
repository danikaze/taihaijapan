const path = require('path');

/**
 * @param  {string} filePath path of the file to parse
 * @return {string}          `filePath` without extension
 */
function stripExtension(filePath) {
  const ext = path.extname(filePath);
  return filePath.substring(0, filePath.length - ext.length);
}

module.exports = stripExtension;
