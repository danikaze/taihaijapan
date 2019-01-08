import { TypifySchema } from '../../utils/typify';

export const schema: TypifySchema = {
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
  // images
  'images.hiddenByDefault': 'bool',
  'images.resize.quality': 'int',
};
