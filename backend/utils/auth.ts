import * as basicAuth from 'basic-auth';
import { authUser } from '../models/users/auth-user';

class Auth {
  public realm: string;
  private middlewareFn;

  public middleware() {
    if (!this.middlewareFn) {
      this.middlewareFn = this.authRequired.bind(this);
    }

    return this.middlewareFn;
  }

  public setRealm(realm: string): void {
    this.realm = realm;
  }

  private authRequired(request, response, next) {
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

  private denyAccess(response): void {
    response.setHeader('WWW-Authenticate', `Basic realm="${this.realm}"`);
    response.sendStatus(401);
    response.end('Access denied');
  }
}

// export a singleton class
export const auth = new Auth();
