import { ValidationSchema } from '..';

export const updateConfigSchema: ValidationSchema = {
  definition: {
    'site.title': {
      validator: 'str',
    },
    'site.shortname': {
      validator: 'str',
    },
    'site.description': {
      validator: 'str',
    },
    'site.baseUrl': {
      validator: 'str',
      options: {
        regExp: '^https?://.*[^/]$',
      },
    },
    'google.analytics': {
      validator: 'str',
    },
    'page.admin.imagesPerPage': {
      validator: 'naturalNum',
    },
    'page.admin.orderBy': {
      validator: 'sortableField',
    },
    'page.admin.reverse': {
      validator: 'bool',
      options: {
        optional: true,
        defaultValue: false,
      },
    },
    'page.index.maxImages': {
      validator: 'naturalNum',
    },
    'page.index.orderBy': {
      validator: 'sortableField',
    },
    'page.index.reverse': {
      validator: 'bool',
      options: {
        optional: true,
        defaultValue: false,
      },
    },
    'page.gallery.imagesPerPage': {
      validator: 'naturalNum',
    },
    'page.gallery.orderBy': {
      validator: 'sortableField',
    },
    'page.gallery.reverse': {
      validator: 'bool',
      options: {
        optional: true,
        defaultValue: false,
      },
    },
    'images.hiddenByDefault': {
      validator: 'bool',
      options: {
        optional: true,
        defaultValue: false,
      },
    },
  },
  options: {
    optional: false,
  },
};
