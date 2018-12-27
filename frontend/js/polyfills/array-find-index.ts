type cbType = (value: any, index: number, obj?: any[]) => boolean;

if (!Array.prototype.findIndex) {
  /**
   * Same as Array.filter but returning the index of the first found element
   * @this {Array<any>} Array to search within
   * @param {(any):boolean} callback   Function returning `true` if it's the desired element
   */
  Array.prototype.findIndex = function findIndex(predicate: cbType, thisArg?: any): number {
    for (let i = 0; i < this.length; i++) {
      if (predicate(this[i], i)) {
        return i;
      }
    }
    return -1;
  };
}
