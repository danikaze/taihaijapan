const webpack = require('webpack');
const path = require('path');
const merge = require('webpack-merge');
const autoprefixer = require('autoprefixer');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const objectAssign = require('object-assign');
const baseConfig = require('./webpack.base.config.js');
const settings = require('./settings');

const moduleConfig = {
  // Fail out on the first error instead of tolerating it
  bail: true,
  cache: false,
  devtool: '#inline-source-map',
  entry: [
    // Style sheets entry point
    settings.paths.mainStyle,
    // Actual entry point for the source code
    settings.paths.src,
    //settings.paths.src + '/index2',
  ],

  // Prod module options
  module: {
    rules: [{
        test: /\.jsx?$/,
        loader: 'istanbul-instrumenter-loader',
        query: { esModules: true },
        include: [ settings.paths.src ]
      }, {
      test: /\.(css|scss|sass)$/,
      exclude: /node_modules/,
      use: ExtractTextPlugin.extract({
        fallback: 'style-loader',
        use: [
          { loader: 'css-loader', options: { importLoaders: 1, sourceMap: true } },
          { loader: 'sass-loader' },
          { loader: 'postcss-loader',
            options: {
              plugins: () => [ autoprefixer('>1%', 'not ie < 9') ],
            }
          },
        ],
      }),
    }, {
      test: /\.(less)$/,
      exclude: /node_modules/,
      use: ExtractTextPlugin.extract({
        fallback: 'style-loader',
        use: [
          { loader: 'css-loader', options: { importLoaders: 1, sourceMap: true } },
          { loader: 'less-loader' },
          { loader: 'postcss-loader',
            options: {
              plugins: () => [ autoprefixer('>1%', 'not ie < 9') ],
            }
          },
        ],
      }),
    },
  ]},

  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('test')
      }
    }),
  ],
};

module.exports = merge(baseConfig, moduleConfig);
