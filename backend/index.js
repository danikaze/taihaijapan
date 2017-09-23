#!/usr/bin/node
const settings = require('./utils/settings');
const Server = require('./Server');
const CtlServer = require('./ctl/CtlServer');
const ctlEmitter = require('./ctl/ctlEmitter');
const log = require('./utils/log');

function initExpressServer() {
  const server = new Server(settings.values);

  server.on('ready', initCtlServer);
  server.start();
}

function initCtlServer() {
  const ctlSettings = settings.values.ctl;
  if (ctlSettings.enabled) {
    const ctlServer = new CtlServer(ctlSettings);
    ctlServer.start();
  }

  ctlEmitter.on('options', (options) => {
    log.verbose('Ctl.options', JSON.stringify(options, null, 2));
  });
}

initExpressServer();
