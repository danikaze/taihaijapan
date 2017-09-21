const yargs = require('yargs')
  .usage('Usage: $0 [options]')
  .help('h')
  .alias('h', 'help')

  .nargs('p', 1)
  .describe('p', 'port where the http server will listen to')
  .alias('p', 'port')

  .describe('logLevel', '[silly|verbose|info|http|warn|error]')
  .nargs('logLevel', 1)

  .describe('logDate', '[true|false]')
  .default('logDate', 'true')
  .boolean('logDate')

  .argv;

module.exports = yargs;

