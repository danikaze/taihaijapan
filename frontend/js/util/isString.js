/**
 * Check if an object is a string
 *
 * @param  {*}       obj Object to check
 * @return {Boolean}     true if `obj` is a string, false otherwise
 *
 * @public
 */
function isString(obj) {
  return typeof obj === 'string' || obj instanceof String;
}

module.exports = isString;
