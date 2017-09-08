/* eslint-disable no-extend-native */

if (!Array.prototype.findIndex) {
  /**
   * Same as Array.filter but returning the index of the first found element
   * @this {Array<*>} Array to search within
   * @param {(any):boolean} callback   Function returning `true` if it's the desired element
   */
  Array.prototype.findIndex = (callback) => {
    for (let i = 0; i < this.length; i++) {
      if (callback(this[i])) {
        return i;
      }
    }
    return -1;
  };
}
