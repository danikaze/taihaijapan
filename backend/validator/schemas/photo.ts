import { ValidationSchema } from '..';
import { splitCsv } from '../../utils/split-csv';
import { trim } from '../../utils/trim';

export const updatePhotoSchema: ValidationSchema = {
  definition: {
    slug: {
      validator: 'str',
      options: {
        regExp: /^[-_\w]+$/,
      },
    },
    title: {
      validator: 'str',
    },
    keywords: {
      validator: 'str',
      options: {
        regExp: /^\s*(\S+\s*(,\s*\S+\s*)*)?$/,
        postTransform: trim,
      },
    },
    visible: {
      validator: 'bool',
    },
    tags: {
      validator: 'tagArray',
      options: {
        preTransform: splitCsv,
      },
    },
  },
  options: {
    optional: false,
  },
};

export const newPhotoSchema: ValidationSchema = {
  definition: {
    ...updatePhotoSchema.definition,
    original: {
      validator: 'str',
    },
  },
  options: updatePhotoSchema.options,
};
