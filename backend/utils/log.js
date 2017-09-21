const npmlog = require('npmlog');
const settings = require('../settings');

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

module.exports = npmlog;
