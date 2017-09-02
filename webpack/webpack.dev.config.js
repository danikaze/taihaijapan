const webpack = require('webpack');
const merge = require('webpack-merge');
const path = require('path');
const autoprefixer = require('autoprefixer');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const baseConfig = require('./webpack.base.config.js');
const settings = require('./settings');

const extractProjectStyle = new ExtractTextPlugin(path.join(
  settings.paths.buildCss,
  '[name].[hash].css'));

const cssNames = settings.options.cssPrefix
                 + '[local]'
                 + (settings.options.cssHash ? '--[hash:base64:8]' : '');

function getHtmlWebpackPlugin(chunk, page) {
  return new HtmlWebpackPlugin({
    template: path.join(settings.paths.srcHtml, page),
    filename: path.join(settings.paths.buildHtml, page),
    chunks: [chunk],
    inject: true,
    minify: false,
  });
}

const moduleConfig = {
  // Entry points
  entry: Object.assign({
    // Connect client to webserver
    'webpack-dev-server': `webpack-dev-server/client?http://${settings.options.host}:${settings.options.port}`,
    // "only-" means to only hot reload for successful updates
    hot: 'webpack/hot/only-dev-server',
  }, settings.entries),

  // Allows app debugging without heavily impacting build time
  devtool: 'inline-source-map',

  // Configuration for dev server
  devServer: {
    // Enables HMR on the dev server
    hot: true,
    // Listen port
    port: settings.options.port,
    // Match the output.path
    contentBase: settings.paths.build,
    // Match the output.publicPath
    publicPath: settings.paths.publicPath,
    // following two lines allows to access the dev server from the local network
    disableHostCheck: true,
    host: '0.0.0.0',
  },

  module: {
    rules: [
      {
        test: /\.(css|scss|sass)$/,
        use: extractProjectStyle.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'postcss-loader', 'sass-loader'],
        }),
      },
      {
        test: /\.(less)$/,
        use: extractProjectStyle.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'postcss-loader', 'less-loader'],
        }),
      },
    ],
  },

  plugins: [
    new webpack.LoaderOptionsPlugin({
      options: {
        'css-loader': {
          modules: true,
          sourceMap: true,
          importLoaders: 1,
          localIdentName: cssNames,
        },
        postcss: [
          autoprefixer(),
        ],
      },
    }),
    // Enable HMR globally
    new webpack.HotModuleReplacementPlugin(),
    // Prints more readable module names in the browser console
    new webpack.NamedModulesPlugin(),
    // Define client-side env variable
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development'),
      },
    }),
    // HTML generator
    getHtmlWebpackPlugin('index', 'index.html'),
    getHtmlWebpackPlugin('gallery', 'gallery/index.html'),
    extractProjectStyle,
  ],
};

module.exports = (env) => {
  return merge(baseConfig, moduleConfig);
};
