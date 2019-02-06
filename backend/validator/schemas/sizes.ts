import { ValidationSchema } from '..';

export const updatePhotoSizeSchema: ValidationSchema = {
  definition: {
    id: {
      validator: 'positiveInt',
    },
    label: {
      validator: 'str',
      options: {
        regExp: /^[a-zA-Z][-_\w]*$/,
        maxLength: 12,
      },
    },
    width: {
      validator: 'naturalNum',
    },
    height: {
      validator: 'naturalNum',
    },
    quality: {
      validator: 'num',
      options: {
        integer: true,
        minRange: 1,
        maxRange: 100,
      },
    },
  },
  options: {
    optional: false,
  },
};
