const net = require('net');
const path = require('path');
const mkdirp = require('mkdirp').sync;
const settings = require('../utils/settings').values.ctl;
const log = require('../utils/log');

class CtlClient {
  start() {
    const port = settings.unixSocket || settings.port;
    const client = new net.Socket();
    this.client = client;

    if (settings.unixSocket) {
      mkdirp(path.dirname(settings.unixSocket));
    }

    client.connect(port, settings.host, () => {
      const msg = JSON.stringify({
        basePath: process.cwd(),
        options: constructOptions(),
        commands: constructCommands(),
      });

      log.verbose('CtlClient', `Sending msg: ${msg}`);
      client.write(msg);
    });

    client.on('data', (data) => log.verbose('CtlClient', `Data recieved: ${data.toString()}`));
    client.on('error', (error) => log.error('CtlClient', `Error (${error})`));
  }
}

function constructOptions() {
  return {
    log: { logLevel: 'silly' },
  };
}

function constructCommands() {
  return undefined;
}

module.exports = CtlClient;
