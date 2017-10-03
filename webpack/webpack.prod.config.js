const webpack = require('webpack');
const merge = require('webpack-merge');
const baseConfig = require('./webpack.base.config.js');

const moduleConfig = {
  bail: true,
  cache: false,
  devtool: 'source-map',

  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),

    new webpack.optimize.UglifyJsPlugin({
      beautify: false,
      comments: false,
      compress: {
        screw_ie8: true,
        warnings: false,
      },
      output: {
        screw_ie8: true,
        comments: false,
      },
      sourceMap: true,
    }),

    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      },
    }),

    new webpack.optimize.ModuleConcatenationPlugin(),
  ],
};

module.exports = (env) => merge(baseConfig(env), moduleConfig);
