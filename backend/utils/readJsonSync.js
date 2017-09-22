const fs = require('fs');

/**
 * @param  {string} filePath file to read. If no extension is specified, it appends `.json` automatically
 * @return {object}          JSON object
 */
function readJsonSync(filePath) {
  const data = fs.readFileSync(filePath);
  return JSON.parse(data);
}

module.exports = readJsonSync;
