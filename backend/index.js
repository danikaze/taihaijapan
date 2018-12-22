#!/usr/bin/node
const settings = require('./utils/serverSettings');
const Server = require('./Server');
const CtlServer = require('./ctl/CtlServer');
const ctlEmitter = require('./ctl/ctlEmitter');
const log = require('./utils/log');
const dbInit = require('./models').init;
const getConfig = require('./models/config/get-config').getConfig;

function initExpressServer(config) {
  const server = new Server(settings.values);

  server.on('ready', initCtlServer);
  server.start(config);
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

dbInit(settings.values.db)
  .then(() => getConfig())
  .then(initExpressServer)
  .catch(log.error.bind('sqlite'));
