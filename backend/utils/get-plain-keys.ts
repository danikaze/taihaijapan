import { addUnique } from './add-unique';

/**
 * Works like `Object.prototype.keys` but recursively, creating keys as paths
 *
 * @example
 * getPlainKeys({ a: { b: 1 }, c: [2, 3], d: 'str' }); // ['a.b', 'c.0', 'c.1', 'd']
 */
export function getPlainKeys(obj: {}, prefix = ''): string[] {
  const keys = [];

  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === 'object') {
      addUnique(keys, getPlainKeys(obj[key], `${key}.`));
    } else if (keys.indexOf(key) === -1) {
      keys.push(prefix ? `${prefix}${key}` : key);
    }
  });

  return keys;
}
