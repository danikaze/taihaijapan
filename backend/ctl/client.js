const net = require('net');
const path = require('path');
const mkdirp = require('mkdirp').sync;
const settings = require('../settings').ctl;
const log = require('../utils/log');

function start() {
  const port = settings.unixSocket || settings.port;
  const client = new net.Socket();

  if (settings.unixSocket) {
    mkdirp(path.dirname(settings.unixSocket));
  }

  client.connect(port, settings.host, () => {
    log.verbose('Client', 'Connected');
    client.write('Hello world from client');
  });

  client.on('data', (data) => {
    log.verbose('Client > data received', data.toString());
  });

  client.on('close', () => {
    log.verbose('Client', 'connection closed');
  });
}

module.exports = {
  start,
};
