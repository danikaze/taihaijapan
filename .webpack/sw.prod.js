const webpack = require('webpack');
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const merge = require('webpack-merge');
const swBase = require('./sw.base');
// const packageJson = require('../package.json');

module.exports = (env) => merge(swBase(env), {
  mode: 'production',
  devtool: 'source-map',

  optimization: {
    minimize: true,
    minimizer: [
      new UglifyJsPlugin({
        test: /\.[jt]s(\?.*)?$/i,
        cache: false,
        parallel: true,
        sourceMap: true,
        uglifyOptions: {
          output: {
            beautify: false,
            comments: /^\/*~/,
          },
        },
      }),
    ],
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      },
    }),

    new webpack.optimize.ModuleConcatenationPlugin(),
  ],
});
