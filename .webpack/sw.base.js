const webpack = require('webpack');
const merge = require('webpack-merge');
const path = require('path');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const packageJson = require('../package.json');
const base = require('./base');
const { getAbsPath } = require('./utils/get-abs-path');
const { getDateString } = require('./utils/get-date-string');

const srcPath = getAbsPath('frontend/root/__temp');

module.exports = (env) => merge(base(env), {
  // entry points
  entry: {
    'sw': path.join(srcPath, 'sw.ts'),
  },

  // output file config
  output: {
    path: getAbsPath('build/backend/public/root'),
    filename: `[name].min.js`,
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
            configFile: getAbsPath('tsconfig.sw.json'),
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
      reportFilename: getAbsPath('build/__info/sw.html'),
    }),

    // add a header comment in each generated file
    new webpack.BannerPlugin({
      raw: true,
      banner: `/*~ ${packageJson.name}/[filebase] @ ${getDateString()} ~*/`,
    }),
  ],

  externals: 'workbox-sw',
});
