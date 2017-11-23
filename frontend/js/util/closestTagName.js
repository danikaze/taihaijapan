/**
 * Search the closest parent element with an specified tag.
 *
 * @param {HTMLElement} elem Element to start searching from
 * @param {string} tag Tag to search
 * @return {HTMLElement} Found element (can be `elem`) or `null` if not found
 */
function closestTagName(elem, tag) {
  if (!elem) {
    return null;
  }

  if (elem.tagName.toLowerCase() === tag.toLowerCase()) {
    return elem;
  }

  return closestTagName(elem.parentElement, tag);
}

module.exports = closestTagName;
