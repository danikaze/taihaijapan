const command = require('./utils/command');
const Server = require('./Server');
const settings = require('./settings');


settings.set(command);
const server = new Server(settings.get().server);

server.on('ready', () => {
  console.log('server ready');
});
server.start();
