const express = require('express');
const compress = require('compression');
const requireAll = require('require-all');
const EventEmitter = require('events');
const hbs = require('hbs');
const log = require('./utils/log');

class Server extends EventEmitter {
  constructor(settings) {
    super();
    this.settings = settings;
  }

  /**
  * Set and start the HTTP server
  */
  start() {
    this.app = express();
    this.app.disable('x-powered-by');
    this.app.use(this.settings.publicPath, express.static(this.settings.publicFolder));
    this.app.use(compress());
    this.app.set('view engine', 'hbs');
    this.app.set('views', this.settings.viewsPath);

    hbs.registerPartials(this.settings.partialsPath, () => {
      this.loadEndPoints(this.settings.controllersPath);
      this.app.use(error404handler);

      this.app.listen(this.settings.port, this.settings.host, () => {
        log.info('Server', `Ready on ${this.settings.host}:${this.settings.port}`);
        this.emit('ready');
      });
    });
  }

  /**
   * Create all the end points defined in the routes folder as modules returning
   * { method, path, callback(request, response) }
   */
  loadEndPoints(routesPath) {
    const files = requireAll({ dirname: routesPath });

    Object.keys(files).forEach((fileName) => {
      const apis = files[fileName](this.app);

      apis.forEach((api) => {
        this.app[api.method](api.path, api.callback);
        log.verbose('Server', `Setting endpoint: ${api.method} ${api.path}`);
      });
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

