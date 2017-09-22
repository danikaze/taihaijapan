const npmlog = require('npmlog');
const settings = require('./settings').values.log;

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
 * log levels (and their numeric levels)
 *  silly   => -Infinity
 *  verbose => 1000,
 *  info    => 2000,
 *  timing  => 2500,
 *  http    => 3000,
 *  notice  => 3500,
 *  warn    => 4000,
 *  error   => 5000,
 *  silent  => Infinity
 */
npmlog.level = settings.logLevel;

if (settings.logDate) {
  npmlog.on('log', (data) => {
    data.message = `[${getDateString()}] ${data.message}`;
  });
}

module.exports = npmlog;
