const yargs = require('yargs')
  .usage('Usage: $0 [options]')
  .help('h')
  .alias('h', 'help')

  .option('port', {
    describe: 'port where the http server will listen to',
    alias: 'p',
    nargs: 1,
  })

  .option('logLevel', {
    describe: 'Minimum type of messages to log',
    choices: ['silly', 'verbose', 'info', 'http', 'warn', 'error'],
    nargs: 1,
  })

  .option('logDate', {
    describe: 'Add date in logs?',
    default: true,
    boolean: true,
  })

  .option('logRequests', {
    describe: 'Log http requests?',
    boolean: true,
  })

  .option('logRequestsFormat', {
    describe: 'Format of the http requests log',
    choices: ['combined', 'common', 'dev', 'short', 'tiny'],
    default: 'tiny',
    nargs: 1,
  });

module.exports = yargs.argv;

