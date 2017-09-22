const yargs = require('yargs');

const options = {
  host: {
    group: 'Server:',
    describe: 'host option for the server',
    nargs: 1,
    type: 'string',
  },
  port: {
    group: 'Server:',
    describe: 'port where the http server will listen to',
    alias: 'p',
    nargs: 1,
    type: 'number',
  },
  logLevel: {
    group: 'Log:',
    describe: 'Minimum type of messages to log',
    choices: ['silly', 'verbose', 'info', 'http', 'warn', 'error'],
    nargs: 1,
    type: 'string',
  },
  logDate: {
    group: 'Log:',
    describe: 'Add date in logs?',
    default: true,
    type: 'boolean',
  },
  logRequests: {
    group: 'Log:',
    describe: 'Format of the http requests log (or "skip" to disable)',
    choices: ['combined', 'common', 'dev', 'short', 'tiny', 'skip'],
    default: 'tiny',
    nargs: 1,
    type: 'string',
  },
};

yargs
.usage('Usage: $0 [options] [settingsFile]')
.help('h')
.alias('h', 'help')
.alias('v', 'version')
.options(options);

module.exports = {
  parse: yargs.parse,
  options,
};

