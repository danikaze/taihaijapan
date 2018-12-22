const express = require('express');
const compress = require('compression');
const morgan = require('morgan');
const requireAll = require('require-all');
const EventEmitter = require('events');
const hbs = require('hbs');
const log = require('./utils/log');
const auth = require('./utils/auth');

class Server extends EventEmitter {
  /**
   * @param {object} settings Settings object as `{ server, log }`
   */
  constructor(settings) {
    super();

    this.serverSettings = settings.server;
    this.logSettings = settings.log;
    auth.setRealm(this.serverSettings.adminRealm);
  }

  /**
  * Set and start the HTTP server
  * @param {object} config Configuration of the page from the database
  */
  start(config) {
    this.app = express();
    this.app.disable('x-powered-by');
    this.app.use(this.serverSettings.publicPath, express.static(this.serverSettings.publicFolder));

    this.app.use(compress());
    this.app.use(morgan(this.logSettings.logRequests));

    this.app.set('view engine', 'hbs');
    this.app.set('views', this.serverSettings.viewsPath);

    this.loadEndPoints(this.serverSettings.controllersPath, config);
    this.app.use(error404handler);

    this.setHbs().then(() => {
      this.app.listen(this.serverSettings.port, this.serverSettings.host, () => {
        log.info('Server', `Ready on ${this.serverSettings.host}:${this.serverSettings.port}`);
        this.emit('ready');
      });
    });

    /*
     * TODO: Define listeners for Express events
     */
  }

  setHbs() {
    return new Promise((resolve, reject) => {
      // register helpers
      const helpers = requireAll({ dirname: this.serverSettings.helpersPath });

      Object.keys(helpers).forEach((fileName) => {
        try {
          const helper = helpers[fileName];
          if (helper.async) {
            hbs.registerAsyncHelper(helper.fn.name, helper.fn);
          } else {
            hbs.registerHelper(helper.fn.name, helper.fn);
          }
        } catch (error) {
          log.error('Server', `Error registering template ${fileName}`);
        }
      });

      // register partials
      hbs.registerPartials(this.serverSettings.partialsPath, resolve);
    });
  }

  /**
   * Create all the end points defined in the routes folder as modules returning
   * { method, path, callback(request, response) }
   */
  loadEndPoints(routesPath, config) {
    const files = requireAll({ dirname: routesPath, recursive: false });

    Object.keys(files).forEach((fileName) => {
      try {
        const apis = files[fileName](this.app, this.serverSettings, config);

        apis.forEach((api) => {
          if (api.middleware) {
            this.app[api.method](api.path, api.middleware, api.callback);
          } else {
            this.app[api.method](api.path, api.callback);
          }
          log.verbose('Server', `Setting endpoint: ${api.method} ${api.path}`);
        });
      } catch (e) {
        log.warn('Server', `No valid endpoint for "${fileName}" (${e}). Ignoring it...`);
      }
    });
  }
}

/**
 * Error 404 handler
 */
function error404handler(request, response, next) {
  response.status(404);
  const msg = `${request.url} not found`;

  // respond with html page
  if (request.accepts('html')) {
    response.send(msg);
    return;
  }

  // respond with json
  if (request.accepts('json')) {
    response.send({ error: msg });
    return;
  }

  // default to plain-text. send()
  response.type('txt').send(msg);
}

module.exports = Server;

