/* eslint-disable no-extend-native */

if (!Array.prototype.findIndex) {
  /**
   * Same as Array.filter but returning the index of the first found element
   * @param {Array<*>}      array      Array to search within
   * @param {(any):boolean} callback   Function returning `true` if it's the desired element
   */
  Array.prototype.findIndex = (array, callback) => {
    for (let i = 0; i < array.length; i++) {
      if (callback(array[i])) {
        return i;
      }
    }
    return -1;
  };
}
