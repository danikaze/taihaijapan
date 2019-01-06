const webpack = require('webpack');
const merge = require('webpack-merge');
const frontendBase = require('./frontend.base');
const packageJson = require('../package.json');

module.exports = (env) => merge(frontendBase(env), {
  mode: 'development',
  devtool: 'inline-source-map',
  watch: true,

  output: {
    filename: `[name]-${packageJson.version}.js`,
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development'),
      },
    }),
  ],
});
