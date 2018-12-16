const auth = require('basic-auth');

// TODO: Use users from the database
class Auth {
  middleware() {
    return this.authRequired.bind(this);
  }

  setCredentials(user, pass) {
    this.user = user;
    this.pass = pass;
  }

  setRealm(realm) {
    this.realm = realm;
  }

  authRequired(request, response, next) {
    const user = auth(request);

    if (this.user && this.pass) {
      if (!user || user.name !== this.user || user.pass !== this.pass) {
        response.setHeader('WWW-Authenticate', `Basic realm="${this.realm}"`);
        response.sendStatus(401);
        response.end('Access denied');
        return;
      }
    }

    next();
  }
}

// export a singleton class
module.exports = new Auth();
