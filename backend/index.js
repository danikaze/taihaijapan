#!/usr/bin/node
const settings = require('./utils/settings').values;
const Server = require('./Server');

const server = new Server(settings);

server.on('ready', () => {});
server.start();
