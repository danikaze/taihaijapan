const webpack = require('webpack');
const merge = require('webpack-merge');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const packageJson = require('../package.json');
const base = require('./base');
const { getAbsPath } = require('./utils/get-abs-path');
const { groupCssFiles } = require('./utils/group-css-files');
const { getDateString } = require('./utils/get-date-string');

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
        exclude: /(node_modules)|(__temp)/,
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
      excludeAssets: /__temp/,
    }),

    // add a header comment in each generated file
    new webpack.BannerPlugin({
      raw: true,
      banner: `/*~ ${packageJson.name}/[filebase] @ ${getDateString()} ~*/`,
    }),

    // css
    new MiniCssExtractPlugin({
      filename: `css/[name]-${packageJson.version}.min.css`,
    }),

    // copy other needed files
    new CopyWebpackPlugin([{
      from: getAbsPath('frontend/public'),
      to: getAbsPath('build/backend/public'),
      ignore: ['.DS_Store'],
    }]),
  ],

  // optimization
  optimization: {
    splitChunks: {
      cacheGroups: {
        adminStyles: groupCssFiles('admin', (issuer) => issuer.indexOf('admin') !== -1),
        publicStyles: groupCssFiles(packageJson.name, (issuer) => issuer.indexOf('admin') === -1),
      },
    },
  },
});
