const auth = require('basic-auth');
const authUser = require('../models/users/auth-user');

class Auth {
  middleware() {
    return this.authRequired.bind(this);
  }

  setRealm(realm) {
    this.realm = realm;
  }

  authRequired(request, response, next) {
    const credentials = auth(request);

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

  denyAccess(response) {
    response.setHeader('WWW-Authenticate', `Basic realm="${this.realm}"`);
    response.sendStatus(401);
    response.end('Access denied');
  }
}

// export a singleton class
module.exports = new Auth();
