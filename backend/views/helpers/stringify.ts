
function stringify(obj, pretty) {
  if (pretty === true) {
    return JSON.stringify(obj, null, 2);
  }
  return JSON.stringify(obj);
}

export const helper = {
  fn: stringify,
  async: false,
};
