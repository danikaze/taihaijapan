const path = require('path');

const settings = {
  server: {
    port: 9999,
    hostname: 'localhost',
    controllersPath: path.join(__dirname, 'controllers'),
    viewsPath: path.join(__dirname, 'views'),
    partialsPath: path.join(__dirname, 'views', 'partials'),
    publicFolder: path.join(__dirname, 'public'),
    publicPath: '/public',
  },
};

function get() {
  return settings;
}

function set(options) {
  const serverSettings = settings.server;

  Object.keys(serverSettings).forEach((key) => {
    setIfDefined(serverSettings, key, options[key]);
  });
}

function setIfDefined(container, prop, value) {
  if (value !== undefined) {
    container[prop] = value;
  }
}

module.exports = {
  set,
  get,
};
