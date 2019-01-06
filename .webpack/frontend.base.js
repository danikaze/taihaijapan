const merge = require('webpack-merge');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const packageJson = require('../package.json');
const base = require('./base');
const { getAbsPath } = require('./utils/get-abs-path');
const { groupCssFiles } = require('./utils/group-css-files');

const srcPath = getAbsPath('frontend/js');

module.exports = (env) => merge(base(env), {
  // entry points
  entry: {
    'js/index': path.join(srcPath, 'index.ts'),
    'js/gallery': path.join(srcPath, 'gallery.ts'),
    'js/admin': path.join(srcPath, 'admin.ts'),
    'js/admin-config': path.join(srcPath, 'admin-config.ts'),
  },

  // output file config
  output: {
    path: getAbsPath('build/backend/public'),
  },

  module: {
    rules: [
      // ts
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: getAbsPath('tsconfig.frontend.json'),
          },
        },
      },
    ],
  },

  // plugins
  plugins: [
    // Allows to see building stats
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
      reportFilename: getAbsPath('build/__info/frontend.html'),
    }),

    // css
    new MiniCssExtractPlugin({
      filename: `css/[name]-${packageJson.version}.min.css`,
    }),
  ],

  // optimization
  optimization: {
    splitChunks: {
      cacheGroups: {
        adminStyles: groupCssFiles('admin', (issuer) => issuer.indexOf('admin') !== -1),
        publicStyles: groupCssFiles('admin', (issuer) => issuer.indexOf('admin') === -1),
      },
    },
  },
});