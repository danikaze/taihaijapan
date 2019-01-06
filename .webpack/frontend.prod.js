const webpack = require('webpack');
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const merge = require('webpack-merge');
const frontendBase = require('./frontend.base');
const packageJson = require('../package.json');

module.exports = (env) => merge(frontendBase(env), {
  mode: 'production',
  devtool: 'source-map',

  output: {
    filename: `[name]-${packageJson.version}.min.js`,
  },

  optimization: {
    minimize: true,
    minimizer: [
      new UglifyJsPlugin({
        test: /\.[jt]s(\?.*)?$/i,
        cache: true,
        parallel: true,
        sourceMap: true,
        uglifyOptions: {
          beautify: false,
          comments: false,
          compress: {},
          output: {},
        },
      }),
      new OptimizeCSSAssetsPlugin({}),
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
