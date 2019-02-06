import { Validator, SchemaDefinition, SchemaOptions, ValidatorOptions, ValidationResult } from 'bulk-validator';
import { newPhotoSchema, updatePhotoSchema } from './schemas/photo';
import { updateConfigSchema } from './schemas/config';
import { updateUserSchema } from './schemas/user';
import { updatePhotoSizeSchema } from './schemas/sizes';

export interface ValidationSchema {
  definition: SchemaDefinition;
  options?: Partial<SchemaOptions>;
}

export const validator = new Validator({
  stopAfterFirstError: false,
});

export interface ValueOfValidatorOptions extends ValidatorOptions {
  values: string[];
}

/**
 * Validates if the passed `data` is one of the values specified in `options.values`
 */
// tslint:disable-next-line: no-any
function valueOfValidator(data: string, options: ValueOfValidatorOptions): ValidationResult<string> {
  const i = options.values.indexOf(data);

  return {
    data,
    valid: i !== -1,
  };
}

validator.addValidator('valueIn', valueOfValidator);

/*
 * Define aliases for common data types
 */
validator.addAlias('tag', 'str', {
  regExp: /^[-_\w]+$/,
});
validator.addAlias('sortableField', 'str', {
  validator: 'valuesOf',
  options: { values: ['created', 'updated', 'slug', 'title'] },
});
validator.addAlias('naturalNum', 'num', {
  rangeMin: 0,
  minEq: true,
  postTransformItem: (data: number) => Number(data) | 0,
});

/*
 * Set validation schemas
 */
validator.addSchema('newPhoto', newPhotoSchema.definition, newPhotoSchema.options);
validator.addSchema('updatePhoto', updatePhotoSchema.definition, updateConfigSchema.options);
validator.addSchema('updateConfig', updateConfigSchema.definition, updateConfigSchema.options);
validator.addSchema('updateUser', updateUserSchema.definition, updateUserSchema.options);
validator.addSchema('updatePhotoSize', updatePhotoSizeSchema.definition, updatePhotoSizeSchema.options);
