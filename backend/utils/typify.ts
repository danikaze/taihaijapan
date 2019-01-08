/* eslint-disable no-bitwise */
import { isBoolean } from 'vanilla-type-check/isBoolean';
import { isString } from 'vanilla-type-check/isString';

export interface TypifySchema {
  [key: string]: 'int' | 'num' | 'bool' | 'json' | 'str';
}

export interface TypifyOptions {
  copy: boolean;
  includeExternal: boolean;
}

/**
 * Typify the properties of an object.
 * Don't include a key:type pair in the schema the value doesn't need any transformation
 *
 * @param  values Object with options as { key: value }
 * @param  schema Object with types as { key: type }
 * @return Option object with the same keys but typified values based on the
 *         schema. Properties not specified in the schema won't be included in
 *         the result when `protect` is `true`. When `false`, they will be
 *         included without any transformation.
 */
export function typify<T = {}>(values: {}, schema: TypifySchema, options?: Partial<TypifyOptions>): T {
  const opt = {
    copy: false,
    includeExternal: true,
    ...options,
  };
  const res = opt.copy ? {} : values;

  Object.keys(values).forEach((key) => {
    const value = values[key];
    const type = schema[key];
    let n: number;

    switch (type) {
      case 'int':
        res[key] = Number(value) | 0;
        break;

      case 'num':
        res[key] = Number(value);
        break;

      case 'bool':
        n = Number(value);
        if (!isNaN(n)) {
          res[key] = (n | 0) !== 0;
        } else if (isString(value)) {
          res[key] = value.toLowerCase() === 'true';
        } else if (!isBoolean(value)) {
          res[key] = (n | 0) !== 0;
        }
        break;

      case 'json':
        try {
          res[key] = JSON.parse(String(value));
        } catch (e) {
          // don't add the value to the result if can't parse the value
        }
        break;

      case 'str':
        res[key] = String(value);
        break;

      default:
        if (opt.includeExternal) {
          res[key] = value;
        } else if (!opt.copy) {
          delete res[key];
        }
    }
  });

  return res as T;
}
