import { Socket } from 'net';
import * as path from 'path';
import { sync as mkdirp } from 'mkdirp';
import { isNumber } from 'vanilla-type-check/isNumber';
import { settings } from '../utils/server-settings';
import { log } from '../utils/log';

const autorun = process.argv.indexOf('autorun') !== -1;

class CtlClient {
  start() {
    const connectTo = settings.ctl.unixSocket || settings.ctl.port;
    const client = new Socket();

    if (settings.ctl.unixSocket) {
      mkdirp(path.dirname(settings.ctl.unixSocket));
    }

    function connectCallback() {
      const msg = {
        basePath: process.cwd(),
        options: undefined,
        commands: undefined,
      };
      const options = constructOptions();
      const commands = constructCommands();

      if (options) {
        msg.options = options;
      }

      if (commands) {
        msg.commands = commands;
      }

      const msgStr = JSON.stringify(msg);
      log.verbose('CtlClient', `Sending msg: ${msgStr}`);
      client.write(msgStr);
    }

    if (isNumber(connectTo)) {
      client.connect(connectTo as number, settings.ctl.host, connectCallback);
    } else {
      client.connect(connectTo as string, connectCallback);
    }

    client.on('data', (data) => log.verbose('CtlClient', `Data recieved: ${data.toString()}`));
    client.on('error', (error) => log.error('CtlClient', `Error (${error})`));
  }
}

function constructOptions() {
  return undefined;
  // {
  //   log: { logLevel: 'silly' },
  // };
}

function constructCommands() {
  return {
    reloadSettings: {},
  };
}

if (autorun) {
  (function runOnce() {
    const client = new CtlClient();
    client.start();
  }());
}

module.exports = CtlClient;
