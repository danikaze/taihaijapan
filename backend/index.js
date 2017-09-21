#!/usr/bin/node
const settings = require('./settings');
const Server = require('./Server');

const server = new Server(settings.server);

server.on('ready', () => {});
server.start();
