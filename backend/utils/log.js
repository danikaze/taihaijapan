const npmlog = require('npmlog');
const settings = require('../settings');

function getDateString() {
  const d = new Date();
  return `${d.getFullYear()}-`
    + `${String(d.getMonth() + 1).padStart(2, '0')}-`
    + `${String(d.getDate()).padStart(2, '0')} `
    + `${String(d.getHours()).padStart(2, '0')}:`
    + `${String(d.getMinutes()).padStart(2, '0')}:`
    + `${String(d.getSeconds()).padStart(2, '0')}.`
    + `${String(d.getMilliseconds()).padStart(2, '0')}`
    ;
}

/*
 * log levels:
 *  silly
 *  verbose
 *  info
 *  http
 *  warn
 *  error
 */
npmlog.level = settings.server.logLevel;

if (settings.server.logDate) {
  npmlog.on('log', (data) => {
    data.message = `[${getDateString()}] ${data.message}`;
  });
}

module.exports = npmlog;
