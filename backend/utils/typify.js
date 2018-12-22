/* eslint-disable no-bitwise */
const isBoolean = require('vanilla-type-check/isBoolean').isBoolean;
const isString = require('vanilla-type-check/isString').isString;

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
function typify(values, schema, options) {
  const opt = {
    copy: false,
    includeExternal: true,
    ...options,
  };
  const res = opt.copy ? {} : values;

  Object.keys(values).forEach((key) => {
    const value = values[key];
    const type = schema[key];
    let str;

    switch (type) {
      case 'int':
        res[key] = parseInt(value, 10);
        break;

      case 'num':
        res[key] = Number(value);
        break;

      case 'bool':
        str = Number(value);
        if (!isNaN(str)) {
          res[key] = (str | 0) !== 0;
        } else if (isString(value)) {
          res[key] = value.toLowerCase() === 'true';
        } else if (!isBoolean(value)) {
          res[key] = (str | 0) !== 0;
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

  return res;
}

module.exports = typify;
