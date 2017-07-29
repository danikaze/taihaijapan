const path = require('path');
const fs = require('fs');
const packageJson = require('../package.json');

const rootDir = fs.realpathSync(process.cwd());

function absPath(relPath) {
  return path.resolve(rootDir, relPath);
}

function getFileName() {
  return `${packageJson.name}-${packageJson.version}`;
}

const options = {
  filename: `${getFileName()}.min.js`,
  cssName: `${getFileName()}.min.css`,
  port: process.env.PORT || 8082,
  host: process.env.HOST || 'localhost',
  cssHash: false,
  cssPrefix: '', // [name]--',
};

const paths = {
  src: absPath('src/js'),
  srcHtml: absPath('src/html'),
  public: absPath('build'),
  build: absPath('build'),
  buildJs: 'js', // js route
  buildHtml: '',  // relative to js route
  buildCss: 'css', // relative to js route
  test: absPath('test'),
  style: absPath('src/styles'),
  imgs: absPath('src/img'),
  htmlTemplate: absPath('src/html/index.html'),
  mainStyle: absPath('src/styles/index.scss'),
  manifest: absPath('build/vendor.manifest.json'),
  publicPath: '/',
};

const alias = {};

module.exports = {
  options,
  paths,
  alias,
};
