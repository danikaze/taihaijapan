import * as express from 'express';
import * as compress from 'compression';
import * as morgan from 'morgan';
import * as requireAll from 'require-all';
import * as EventEmitter from 'events';
import * as hbs from 'hbs';

import { PATH_HBS_I18N, PATH_HBS_VIEWS, PATH_HBS_PARTIALS, PATH_HBS_HELPERS, PATH_PUBLIC, URL_PUBLIC } from '../constants/paths';
import { HTTP_CODE_404_NOT_FOUND } from '../constants/http';
import { Config } from '../interfaces/model';
import { ServerSettings, LogSettings, Settings } from './settings';
import { galleryControllers } from './controllers/gallery';
import { adminControllers } from './controllers/admin';
import { log } from './utils/log';
import { auth } from './utils/auth';
import { I18n } from './utils/i18n';

export class Server extends EventEmitter {
  private readonly serverSettings: ServerSettings;
  private readonly logSettings: LogSettings;
  private readonly i18n: I18n;
  private app: express.Application;

  /**
   * @param settings Settings object as `{ server, log }`
   */
  constructor(settings: Settings) {
    super();

    this.serverSettings = settings.server;
    this.logSettings = settings.log;
    this.i18n = new I18n();
    this.i18n.loadResources([PATH_HBS_I18N]);

    auth.setRealm(this.serverSettings.adminRealm);
  }

  /**
   * Error 404 handler
   */
  protected static error404handler(request: express.Request, response: express.Response): void {
    response.status(HTTP_CODE_404_NOT_FOUND);
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

  /**
   * Set and start the HTTP server
   *
   * @param config Configuration of the page from the database
   */
  public start(config: Config): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.app = express();
      this.app.disable('x-powered-by');
      this.app.use(URL_PUBLIC, express.static(PATH_PUBLIC));

      this.app.use(compress());
      this.app.use(morgan(this.logSettings.logRequests));

      this.loadEndPoints(config);
      this.app.use(Server.error404handler);

      this.setHbs().then(() => {
        this.app.listen(this.serverSettings.port, this.serverSettings.host, () => {
          log.info('Server', `Ready on ${this.serverSettings.host}:${this.serverSettings.port}`);
          this.emit('ready');
          resolve();
        });
      });

      /*
      * TODO: Define listeners for Express events
      */
    });
  }

  /**
   * Initialize Handlebars
   */
  protected setHbs(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      // register the engine
      this.app.set('view engine', 'hbs');

      // register the views
      this.app.set('views', PATH_HBS_VIEWS);

      // register partials
      hbs.registerPartials(PATH_HBS_PARTIALS, resolve);

      // register helpers
      const helpers = requireAll({ dirname: PATH_HBS_HELPERS });

      Object.keys(helpers).forEach((fileName) => {
        try {
          const helper = helpers[fileName].helper;

          if (!helper.fn.name || helper.fn.name === 'fn') {
            log.warn('Server', `HBS helper from file "${fileName}" should have a proper name`);
          }

          if (helper.async) {
            throw new Error('HBS async helper not supported!');
          }
          hbs.registerHelper(helper.fn.name, helper.fn);
          log.verbose('Server', `HBS helper registered: ${helper.fn.name}`);
        } catch (error) {
          log.error('Server', `Error registering HBS helper ${fileName} (${error})`);
        }
      });
    });
  }

  /**
   * Create all the end points defined in the routes folder as modules returning
   * { method, path, callback(request, response) }
   */
  protected loadEndPoints(config: Config): void {
    [
      adminControllers,
      galleryControllers,
    ].forEach((getControllers) => {
      const apis = getControllers(this.i18n, this.serverSettings, config);

      apis.forEach((api) => {
        if (api.middleware) {
          this.app[api.method](api.path, api.middleware, api.callback);
        } else {
          this.app[api.method](api.path, api.callback);
        }
        log.verbose('Server', `Setting endpoint: ${api.method} ${api.path}`);
      });
    });
  }
}
