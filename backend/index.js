const Server = require('./Server');
const settings = require('./settings');

const server = new Server(settings.server);

server.on('ready', () => {
  console.log('server ready');
});
server.start();
