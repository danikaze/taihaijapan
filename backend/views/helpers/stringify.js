
function stringify(obj, pretty) {
  if (pretty === true) {
    return JSON.stringify(obj, null, 2);
  }
  return JSON.stringify(obj);
}

module.exports = {
  fn: stringify,
  asnyc: false,
};
