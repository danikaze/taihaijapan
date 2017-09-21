const path = require('path');
const command = require('./utils/command');

const settings = (() => {
  const s = {
    server: {
      port: 9999,
      host: 'localhost',
      controllersPath: path.join(__dirname, 'controllers'),
      viewsPath: path.join(__dirname, 'views'),
      partialsPath: path.join(__dirname, 'views', 'partials'),
      publicFolder: path.join(__dirname, 'public'),
      publicPath: '/public',
      logLevel: 'error',
    },
  };

  set(s.server, command);
  return s;
})();

function set(base, options) {
  Object.keys(base).forEach((key) => {
    setIfDefined(base, key, options[key]);
  });
}

function setIfDefined(container, prop, value) {
  if (value !== undefined) {
    container[prop] = value;
  }
}

module.exports = settings;
