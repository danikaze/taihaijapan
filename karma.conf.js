const isWin = process.platform === 'win32';

const browsers = [
  'PhantomJS',
  'ChromeWithoutSecurity',
  'Firefox',
  isWin ? 'InternetExplorer' : 'Safari',
];
const webpackConfig = require('./webpack/webpack.test.config');

module.exports = (config) => {
  config.set({
    browsers,
    concurrency: Infinity,
    frameworks: ['mocha', 'chai', 'sinon'],
    reporters: ['progress', 'coverage-istanbul'],
    files: [
      'node_modules/babel-polyfill/dist/polyfill.js',
      'test/**/*.spec.js',
      'test/**/*.test.js',
      'src/*.js',
    ],
    singleRun: true,
    autoWatch: false,
    preprocessors: {
      'test/**/*.js': ['webpack', 'sourcemap'],
      'src/**/*.js': ['webpack', 'sourcemap'],
    },
    webpack: webpackConfig,
    webpackMiddleware: { noInfo: true },
    colors: true,
    logLevel: config.LOG_INFO, // config.LOG_DISABLE,
    coverageIstanbulReporter: {
      dir: './coverage/%browser%/',
      reporters: [
        { type: 'lcov', subdir: '.' },
        { type: 'text-summary' },
      ],
    },
    captureTimeout: 60000,
    browserDisconnectTimeout: 10000,
    browserNoActivityTimeout: 10000,
    customLaunchers: {
      ChromeWithoutSecurity: {
        base: 'Chrome',
        flags: ['--disable-web-security'],
      },
    },
  });
};
