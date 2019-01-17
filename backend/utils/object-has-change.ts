/**
 * Return if there's any property of `base` with a different value in `changes`.
 * If the property to check is `undefined` in `changes`, it's ignored.
 * Comparisons are shallow.
 */
export function objectHasChange(base: {}, changes: {}): boolean {
  const keys = Object.keys(base);

  for (const key of keys) {
    if (changes[key] !== undefined && base[key] !== changes[key]) {
      return true;
    }
  }

  return false;
}
