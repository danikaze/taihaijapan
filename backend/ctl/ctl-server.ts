import { Socket, createServer } from 'net';
import * as path from 'path';
import { sync as mkdirp } from 'mkdirp';
import { CtlSettings } from '../settings';
import { log } from '../utils/log';
import { ctlEmitter } from './ctl-emitter';

export class CtlServer {
  private readonly settings;
  private ctlServer;

  constructor(settings: CtlSettings) {
    this.settings = settings;
    this.ctlServer = null;
  }

  /**
   * Basic TCP server based on the settings
   */
  public start() {
    const ctlServer = createServer(connectionListener.bind(this));
    this.ctlServer = ctlServer;
    const unixSocket = this.settings.unixSocket;

    if (unixSocket) {
      mkdirp(path.dirname(unixSocket));
    }
    ctlServer.listen(unixSocket || this.settings.port);

    // server bound after listen()
    ctlServer.on('listening', () => {
      const ad = this.ctlServer.address();
      const msg = typeof ad === 'string'
        ? `listening on ${ad}`
        : `listening ${ad.address}:${ad.port} using ${ad.family}`;
      log.info('CtlServer', msg);
    });

    // server closes, and all active connections are ended
    ctlServer.on('close', () => log.info('CtlServer', 'closed'));

    // error ocurrs
    ctlServer.on('err', (error) => {
      ctlServer.close(() => log.error('Server', `Shutting down! (${error})`));
    });
  }
}

/**
 * Handler for the incoming TCP connection
 *
 * @param socket incoming connection
 */
function connectionListener(socket: Socket) {
  socket.on('data', (data) => {
    // data is a Buffer object
    try {
      const json = JSON.parse(data.toString());
      const options = json.options;
      const commands = json.commands;

      if (options) {
        ctlEmitter.emit('options', options);
        Object.keys(options).forEach((sectionName) => {
          const section = options[sectionName];
          Object.keys(section).forEach((key) => {
            ctlEmitter.emit(`option.${sectionName}.${key}`, section[key]);
          });
        });
      }

      if (commands) {
        ctlEmitter.emit('commands', commands);
        Object.keys(commands).forEach((key) => {
          ctlEmitter.emit(`command.${key}`, commands[key]);
        });
      }
    } catch (error) {
      log.warn('CtlServer', `Received malformed data: ${data.toString()}`);
    }
    socket.end();
  });

  socket.on('timeout', () => log.warn('CtlServer', 'socket.timeout'));
  socket.on('error', (error) => log.warn('CtlServer', `socket.error (${error})`));
}
