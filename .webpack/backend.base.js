const merge = require('webpack-merge');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CopyWebpackPlugin = require('copy-webpack-plugin');

const base = require('./base');
const { getAbsPath } = require('./utils/get-abs-path');

module.exports = (env) => merge(base(env), {
  // entry points
  entry: {
    'index': getAbsPath('backend/index.ts'),
  },

  // output file config
  output: {
    path: getAbsPath('build'),
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
            configFile: getAbsPath('tsconfig.backend.json'),
          },
        },
      },
      {
        test: /(sqlite3)|(sharp)/,
        use: 'node-loader'
      }
    ],
  },

  // plugins
  plugins: [
    // Allows to see building stats
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
      reportFilename: getAbsPath('build/__info/backend.html'),
    }),

    // copy other needed files
    new CopyWebpackPlugin([
      {
        from: getAbsPath('package.json'),
        to: getAbsPath('build/package.json'),
      },
      {
        from: getAbsPath('package.json'),
        to: getAbsPath('build/package.json'),
        ignore: ['.DS_Store'],
        exclude: ['*.ts'],
      },
    ]),
  ],
});
