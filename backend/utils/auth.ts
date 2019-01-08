import { Request, Response, NextFunction } from 'express';
import * as basicAuth from 'basic-auth';
import { authUser } from '../models/users/auth-user';

const HTTP_CODE_DENY = 401;

class Auth {
  public realm: string;
  private middlewareFn: (request: Request, response: Response, next: NextFunction) => void;

  /**
   * Get the middleware function to use in express
   */
  public middleware(): (request: Request, response: Response, next: NextFunction) => void {
    if (!this.middlewareFn) {
      this.middlewareFn = this.authRequired.bind(this);
    }

    return this.middlewareFn;
  }

  /**
   * Set the realm to use in the authentication
   */
  public setRealm(realm: string): void {
    this.realm = realm;
  }

  /**
   * Function that checks if the user is logged or not
   */
  private authRequired(request, response, next): void {
    const credentials = basicAuth(request);

    if (!credentials) {
      this.denyAccess(response);
      return;
    }

    authUser(credentials.name, credentials.pass).then((userData) => {
      if (!userData) {
        this.denyAccess(response);
        return;
      }

      next();
    });
  }

  /**
   * Send the access denied status to the response
   */
  private denyAccess(response: Response): void {
    response.setHeader('WWW-Authenticate', `Basic realm="${this.realm}"`);
    response.sendStatus(HTTP_CODE_DENY);
    response.end('Access denied');
  }
}

// export a singleton class
export const auth = new Auth();
