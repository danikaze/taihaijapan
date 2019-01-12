const webpack = require('webpack');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const autoprefixer = require('autoprefixer');
const path = require('path');

const packageJson = require('../package.json');
const { getAbsPath } = require('./utils/get-abs-path');
const { getDateString } = require('./utils/get-date-string');

module.exports = (env) => ({
  // output file config
  output: {
    publicPath: '/',
  },

  // module rules
  module: {
    rules: [
      // styles
      {
        test: /\.(css|scss|sass)$/,
        exclude: /node_modules/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: { sourceMap: true, importLoaders: 1 },
          },
          {
            loader: 'sass-loader',
            options: { sourceMap: true },
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => [autoprefixer('>1%', 'not ie < 9')],
            },
          },
        ],
      },
      {
        test: /\.(png|jpg|gif|jpeg|svg|woff|woff2|ttf|eot|ico)$/,
        use: {
          loader: "url-loader",
          options: {
            limit: 10000,
            fallback: 'file-loader',
            name: '[name]-[hash].[ext]',
            outputPath: 'css',
            publicPath: './',
          },
        },
      },
    ],
  },

  plugins: [
    // add a header comment in each generated file
    new webpack.BannerPlugin({
      raw: true,
      banner: `/*~ ${packageJson.name}/[filebase] @ ${getDateString()} ~*/`,
    }),
  ],

  // misc. config
  target: 'node',
  context: path.dirname(__dirname),
  node: {
    __dirname: false,
    __filename: false
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
    plugins: [
      new TsconfigPathsPlugin({ configFile: getAbsPath('tsconfig.json') }),
    ],
  },

  optimization: {
    minimize: false,
    namedModules: true,
  },

  stats: {
    children: false,
  },
});
