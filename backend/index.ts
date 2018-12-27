import { settings } from './utils/server-settings';
import { Server } from './server';
import { CtlServer } from './ctl/ctl-server';
import { ctlEmitter } from './ctl/ctl-emitter';
import { log } from './utils/log';
import { init as modelInit } from './models/index';
import { init as addPhotoInit } from './models/gallery/add-photo';
import { init as configInit } from './models/config/get-config';
import { getConfig } from './models/config/get-config';

function initExpressServer(config) {
  const server = new Server(settings);

  server.on('ready', initCtlServer);
  server.start(config);
}

function initCtlServer() {
  const ctlSettings = settings.ctl;
  if (ctlSettings.enabled) {
    const ctlServer = new CtlServer(ctlSettings);
    ctlServer.start();
  }

  // ctlEmitter.on('options', (options) => {
  //   log.verbose('Ctl.options', JSON.stringify(options, null, 2));
  // });
}

modelInit(settings)
  .then(() => configInit(settings.cacheTtl.config))
  .then(() => addPhotoInit(settings.server))
  .then(() => getConfig())
  .then(initExpressServer)
  .catch(log.error.bind('sqlite'));
