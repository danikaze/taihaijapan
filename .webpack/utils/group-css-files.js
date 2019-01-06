function recursiveIssuer(x) {
  if (x.issuer) {
    return recursiveIssuer(x.issuer);
  } else {
    return Array.from(x._chunks)[0].name;
  }
}

/**
 * Return an object to use as value in the `optimization.splitChunks.cacheGroups[key]` webpack config
 *
 * @param {string} name
 * @param {(string) => boolean} condition
 */
function groupCssFiles(name, condition) {
  return {
    name,
    test: (m) => m.constructor.name === 'CssModule' && condition(recursiveIssuer(m)),
    chunks: 'all',
    enforce: true,
  };
}

module.exports = { groupCssFiles };
