const webpack = require('webpack');
const merge = require('webpack-merge');
const swBase = require('./sw.base');
// const packageJson = require('../package.json');

module.exports = (env) => merge(swBase(env), {
  mode: 'development',
  devtool: 'inline-source-map',
  watch: true,

  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development'),
      },
    }),
  ],
});
