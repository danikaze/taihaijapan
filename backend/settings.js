const path = require('path');

module.exports = {
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
