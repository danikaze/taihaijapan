/**
 * Add items to an array only if they are not already there
 * It modifies the array, doesn't return a new one
 *
 * @param base Array to modify
 * @param additions List of items to add
 */
export function addUnique<T>(base: T[], additions: T[]): void {
  for (const item of additions) {
    if (base.indexOf(item) === -1) {
      base.push(item);
    }
  }
}
