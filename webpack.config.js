/**
 * @param   {String} env [prod|dev]
 * @returns              Webpack configuration based on the environment
 */
function buildConfig(env) {
  return require(`./webpack/webpack.${env}.config.js`)(env);
}

module.exports = buildConfig;
