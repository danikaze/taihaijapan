const crypto = require('crypto');
const fs = require('fs');

/**
 * Get a hash based on a file.
 * It will return always the same for the same entry
 *
 * @param {String} filePath
 */
function getFileHash(filePath) {
  return new Promise((resolve, reject) => {
    const fd = fs.createReadStream(filePath);
    const hash = crypto.createHash('sha1');
    hash.setEncoding('hex');

    fd.on('end', () => {
      hash.end();
      resolve(hash.read());
    });

    fd.pipe(hash);
  });
}

module.exports = getFileHash;
