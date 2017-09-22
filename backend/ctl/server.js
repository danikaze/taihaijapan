const net = require('net');
const path = require('path');
const mkdirp = require('mkdirp').sync;
const settings = require('../settings').ctl;
const log = require('../utils/log');

function serverCtl(socket) {
  socket.on('end', () => {
    // exec'd when socket other end of connection sends FIN packet
    log.verbose('Server', '[socket on end]');
  });
  socket.on('data', (data) => {
    // data is a Buffer object
    log.verbose('Server > data', data.toString());
  });
  socket.on('end', () => {
    // emitted when the other end sends a FIN packet
  });

  socket.on('timeout', () => {
    log.verbose('Server', 'socket.timeout');
  });

  socket.on('drain', () => log.verbose('Server', '[socket on drain]'));
  socket.on('error', () => log.error('Server', 'socket.error'));
  socket.on('close', () => log.verbose('Server', 'socket.close'));
  socket.pipe(socket);
}

function start() {
  const server = net.createServer(serverCtl);

  if (settings.unixSocket) {
    mkdirp(path.dirname(settings.unixSocket));
  }
  server.listen(settings.unixSocket || settings.port);

  server.on('listening', () => {
    const ad = server.address();
    if (typeof ad === 'string') {
      log.verbose('Server', `listening on ${ad}`);
    } else {
      log.verbose('Server', `listening ${ad.address}:${ad.port} using ${ad.family}`);
    }
  });

  server.on('connection', (socket) => {
    server.getConnections((err, count) => {
      log.verbose('Server', `${count} open connections!`);
    });
  });

  server.on('close', () => { log.verbose('Server', 'close'); });
  server.on('err', (err) => {
    server.close(() => { log.err('Server', 'shutting down!'); });
  });
}

start();
