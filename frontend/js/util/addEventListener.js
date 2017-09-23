/**
 * IE8+ compatible event handler
 *
 * @param {DOM}      el
 * @param {String}   eventName
 * @param {Function} handler
 */
function addEventListener(el, eventName, handler) {
  if (el.addEventListener) {
    el.addEventListener(eventName, handler);
  } else {
    el.attachEvent(`on${eventName}`, () => {
      handler.call(el);
    });
  }
}

module.exports = addEventListener;
