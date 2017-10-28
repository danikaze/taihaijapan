const net = require('net');
const path = require('path');
const mkdirp = require('mkdirp').sync;
const settings = require('../utils/serverSettings').values.ctl;
const log = require('../utils/log');

const autorun = process.argv.indexOf('autorun') !== -1;

class CtlClient {
  start() {
    const port = settings.unixSocket || settings.port;
    const client = new net.Socket();
    this.client = client;

    if (settings.unixSocket) {
      mkdirp(path.dirname(settings.unixSocket));
    }

    client.connect(port, settings.host, () => {
      const msg = {
        basePath: process.cwd(),
      };
      const options = constructOptions();
      const commands = constructCommands();

      if (options) {
        msg.options = options;
      }

      if (commands) {
        msg.commands = commands;
      }

      const msgStr = JSON.stringify(msg);
      log.verbose('CtlClient', `Sending msg: ${msgStr}`);
      client.write(msgStr);
    });

    client.on('data', (data) => log.verbose('CtlClient', `Data recieved: ${data.toString()}`));
    client.on('error', (error) => log.error('CtlClient', `Error (${error})`));
  }
}

function constructOptions() {
  return undefined;
  // {
  //   log: { logLevel: 'silly' },
  // };
}

function constructCommands() {
  return {
    reloadSettings: {},
  };
}

if (autorun) {
  (function runOnce() {
    const client = new CtlClient();
    client.start();
  }());
}

module.exports = CtlClient;
