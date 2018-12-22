const schema = {
  // internal
  'schema.version': 'int',
  'config.cache': 'int',
  // global
  'site.title': 'str',
  'site.realm': 'str',
  'google.analytics': 'str',
  // page.admin
  'page.admin.route': 'str',
  'page.admin.imagesPerPage': 'int',
  'page.admin.orderBy': 'str',
  'page.admin.reverse': 'bool',
  // page.index
  'page.index.maxImages': 'int',
  'page.index.orderBy': 'str',
  'page.index.reverse': 'bool',
  // page.gallery
  'page.gallery.imagesPerPage': 'int',
  'page.gallery.orderBy': 'str',
  'page.gallery.reverse': 'bool',
  // images.paths
  'images.originalPath': 'str',
  'images.temporalPath': 'str',
  'images.path': 'str',
  'images.baseUrl': 'str',
  // images.resize
  'images.resize.policy': 'str',
  'images.resize.outputFile': 'str',
  'images.resize.format': 'str',
  'images.resize.formatOptions': 'json',
  'images.hiddenByDefault': 'bool',
};

module.exports = schema;
