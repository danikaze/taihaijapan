import { createHash } from 'crypto';
import { createReadStream } from 'fs';

/**
 * Get a hash based on a file.
 * It will return always the same for the same entry
 *
 * @param {String} filePath
 */
export function getFileHash(filePath): Promise<string> {
  return new Promise((resolve, reject) => {
    const fd = createReadStream(filePath);
    const hash = createHash('sha1');
    hash.setEncoding('hex');

    fd.on('end', () => {
      hash.end();
      resolve(hash.read().toString());
    });

    fd.pipe(hash);
  });
}
