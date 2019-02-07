import { ValidationSchema } from '..';

export const updateUserSchema: ValidationSchema = {
  definition: {
    username: {
      validator: 'str',
      options: {
        regExp: /^[a-zA-Z][-_\w]+$/,
        minLength: 1,
        maxLength: 50,
      },
    },
    lang: {
      validator: 'str',
    },
    password: {
      validator: 'str',
      options: {
        optional: true,
      },
    },
  },
  options: {
    optional: false,
  },
};
