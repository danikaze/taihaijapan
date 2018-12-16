const path = require('path');
const fs = require('fs');
const packageJson = require('../package.json');

const rootDir = fs.realpathSync(process.cwd());

function absPath(relPath) {
  return path.resolve(rootDir, relPath);
}

const options = {
  filename: `js/[name]-${packageJson.version}.min.js`,
  cssNameIndex: `${packageJson.name}-${packageJson.version}.min.css`,
  cssNameAdmin: `admin-${packageJson.version}.min.css`,
};

const paths = {
  src: absPath('frontend/js'),
  srcHtml: absPath('frontend/public'),
  srcStyle: absPath('frontend/styles'),
  public: absPath('backend/public'),
  build: absPath('backend/public'),
  buildJs: 'js', // js route
  buildHtml: '',  // relative to js route
  buildCss: 'css', // relative to js route
  buildInfo: absPath('buildInfo'),
  test: absPath('test'),
  style: absPath('frontend/styles'),
  imgs: absPath('frontend/img'),
  htmlTemplate: absPath('frontend/html/index.html'),
  mainStyle: absPath('frontend/styles/index.scss'),
  publicPath: '/',
};

const entries = {
  // css: paths.mainStyle,
  index: path.join(paths.src, 'index.js'),
  gallery: path.join(paths.src, 'gallery.js'),
  admin: path.join(paths.src, 'admin.js'),
  'admin.config': path.join(paths.src, 'admin.config.js'),
};

module.exports = {
  options,
  paths,
  entries,
};
