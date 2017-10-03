const webpack = require('webpack');
const merge = require('webpack-merge');
const baseConfig = require('./webpack.base.config.js');

const moduleConfig = {
  bail: false,
  cache: true,
  devtool: 'inline-source-map',
  watch: true,

  plugins: [
    // Prints more readable module names in the browser console
    new webpack.NamedModulesPlugin(),
    // Define client-side env variable
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development'),
      },
    }),
  ],
};

module.exports = (env) => merge(baseConfig(env), moduleConfig);
