import * as npmlog from 'npmlog';
// const ctlEmitter = require('../ctl/ctl-emitter');

// function getDateString(): string {
//   const d = new Date();
//   return `${d.getFullYear()}-`
//     + `${String(d.getMonth() + 1).padStart(2, '0')}-`
//     + `${String(d.getDate()).padStart(2, '0')} `
//     + `${String(d.getHours()).padStart(2, '0')}:`
//     + `${String(d.getMinutes()).padStart(2, '0')}:`
//     + `${String(d.getSeconds()).padStart(2, '0')}.`
//     + `${String(d.getMilliseconds()).padStart(2, '0')}`
//     ;
// }

/*
 * Which level to use when logging?
 *
 *  method  | priority  | usage
 * ---------+-----------+--------------------------------------------
 *  silly   | -Infinity | blabbery, detailed processes information
 *  verbose | 1000,     | things happening, but not-so-important info
 *  info    | 2000,     | processes taking place (start, stop, etc.)
 *  warn    | 4000,     | recuperable error or unexpected things
 *  error   | 5000,     | errors affecting the operation/service
 *  silent  | Infinity  |
 */

export function setLogDate(format: boolean): void {
  // if (format) {
  //   npmlog.on('log', (data) => {
  //     data.message = `[${getDateString()}] ${data.message}`;
  //   });
  // }
}

// ctlEmitter.on('option.log.logLevel', (logLevel) => {
  // npmlog.level = logLevel;
// });
// ctlEmitter.on('option.log.logDate', npmlog.setLogDate);

export const log = npmlog;
