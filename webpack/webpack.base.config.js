const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');
const settings = require('./settings');

module.exports = {
  // Output file config
  output: {
    // Output filename/bundle
    filename: settings.options.filename,
    // Path to the output filename
    path: path.join(settings.paths.build),
    // Required for HMR to know where to load the hot update chunks
    publicPath: settings.paths.publicPath,
  },

  plugins: [
    new CopyWebpackPlugin([{
      context: settings.paths.public,
      from: '**/*',
      to: settings.paths.build,
    }]),
  ],

  module: {
    rules: [
      // support jsx files
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        enforce: 'pre',
        include: settings.paths.src,
        use: 'eslint-loader',
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        include: [
          settings.paths.src,
        ],
        use: [
          { loader: 'babel-loader', options: { cacheDirectory: true } },
        ],
      },
      // fonts
      {
        test: /\.(ttf|otf|eot|svg|woff(2)?)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        exclude: /node_modules/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[hash].[ext]',
            outputPath: 'fonts/',
          },
        }],
      },
      // images
      {
        test: /\.(png|jpg|gif|webp)$/,
        exclude: /node_modules/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 5000,
            name: '[hash].[ext]',
            outputPath: 'img/',
          },
        }],
      }
    ],
  },
};
