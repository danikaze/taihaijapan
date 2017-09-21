const yargs = require('yargs')
  .usage('Usage: $0 [options]')
  .alias('p', 'port')
  .nargs('p', 1)
  .describe('p', 'port where the http server will listen to')
  .help('h')
  .alias('h', 'help')
  .argv;


module.exports = yargs;

