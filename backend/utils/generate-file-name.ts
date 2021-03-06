import * as path from 'path';
import { getFileHash } from './get-file-hash';

const REGEXP_RANDOM = /{random(:(\d+))?}/gi;
const REGEXP_HASH = /{hash(:(\d+))?}/gi;
const FILE_NAME_HASH_SIZE = 32;
const FILE_NAME_RANDOM_SIZE = 32;

const generatedRandoms = [];

const generators = {
  ext: getExt,
  basename: getBasename,
  timestamp: getTimestamp,
};
const generatorKeys = Object.keys(generators);

/**
 * @returns Random number between [min, max)
 */
function randomInt(min: number, max: number): number {
  const r = Number(String(Math.random()).substring(2));
  return (r % (max - min)) + min;
}

/**
 * @returns Extension of the file (including '.')
 */
function getExt(filePath: string): string {
  return path.extname(filePath);
}

/**
 * @returns Name of the file without the extension
 */
function getBasename(filePath: string): string {
  const basename = path.basename(filePath);
  return basename.substring(0, basename.lastIndexOf('.'));
}

/**
 * @returns Timestamp in seconds
 */
function getTimestamp(): string {
  return String(new Date().getTime() / 1000);
}

/**
 * Get a unique random string.
 *
 * @param size Size of the string to return
 * @returns Random string of `size` size
 */
function getRandomString(size: number): string {
  let res: string;
  const A_CHR = 'A'.charCodeAt(0);
  const Z_CHR = 'Z'.charCodeAt(0);
  const LOWER = 'a'.charCodeAt(0) - A_CHR;

  do {
    res = '';
    for (let i = 0; i < size; i++) {
      res += String.fromCharCode(randomInt(A_CHR, Z_CHR) + (randomInt(0, 1) * LOWER));
    }
  } while (generatedRandoms.indexOf(res) !== -1);
  generatedRandoms.push(res);

  return res;
}

/**
 * Generate a file name based on a pattern and a file
 * The accepted placeholders are:
 * `{random}|{hash}|{basename}|{ext}|{size}|{timestamp}`
 * {hash} won't be available if `filePath` is not provided.
 * Custom values `{key}` can be padded with '0' if specified as `{key:N}`, being `N` the total size,
 * or with a custom character `C` if specified as `{key:N,C}`
 *
 * @param pattern  Pattern for the new name, with the accepted placeholders
 * @param filePath Path to the original file
 * @param values   Extra values to use in the pattern as `{ key: value }`
 * @returns        Promise resolved to the file name
 */
export function generateFileName(pattern: string, filePath?: string, values?: {}): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    let newFileName = pattern;
    const hashPromise: Promise<void | string> = !filePath
      || pattern.search(new RegExp(REGEXP_HASH)) === -1 ? Promise.resolve()
                                                        : getFileHash(filePath);

    hashPromise.then((fileHash) => {
      // replace basic generators
      generatorKeys.forEach((key) => {
        newFileName = newFileName.replace(new RegExp(`{${key}}`, 'gi'), generators[key](filePath));
      });
      // replace random:#
      newFileName = newFileName.replace(REGEXP_RANDOM, (m, x, size) =>
        getRandomString(size || FILE_NAME_RANDOM_SIZE));
      // replace hash:#
      if (fileHash) {
        newFileName = newFileName.replace(REGEXP_HASH, (m, x, size) =>
          fileHash.substring(0, size || FILE_NAME_HASH_SIZE));
      }
      // replace custom values
      if (values) {
        Object.keys(values).forEach((key) => {
          newFileName = newFileName.replace(new RegExp(`{${key}(:((\\d+)(,(.))?))?}`, 'gi'), (...match) => {
            const value = values[key];
            const padStr = match[5] || '0'; // tslint:disable-line:no-magic-numbers
            if (match[3]) { // tslint:disable-line:no-magic-numbers
              return String(value).padStart(match[3], padStr); // tslint:disable-line:no-magic-numbers
            }
            return value;
          });
        });
      }

      resolve(newFileName);
    });
  });
}
