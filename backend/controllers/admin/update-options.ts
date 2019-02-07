import { Request, Response } from 'express';
import { HTTP_CODE_400_BAD_REQUEST } from '../../../constants/http';
import { INVALID_PARAMETERS_ERROR, PASSWORDS_DONT_MATCH_ERROR, INTERNAL_ERROR } from '../../../constants/errors';
import { updateConfig } from '../../models/config/update-config';
import { setSizes } from '../../models/gallery/set-sizes';
import { getUser } from '../../models/users/get-user';
import { updateUser } from '../../models/users/update-user';
import { Config, Size } from '../../../interfaces/model';
import { NewUser } from '../../../interfaces/model-ops';
import { ServerSettings } from '../../settings';
import { objectHasChange } from '../../utils/object-has-change';
import { validator } from '../../validator';

/**
 * Update the options in the admin page
 *
 * - body: {
 *     sizes: Size[],
 *     admin: User,
 *     ...Config,
 *   }
 */
export function updateOptions(serverSettings: ServerSettings, request: Request, response: Response) {
  const ADMIN_USER_ID = 1;

  getUser(ADMIN_USER_ID).then((oldAdmin) => {
    const { sizes, admin, ...config } = request.body;
    const errors = [];

    /*
     * config validation
     */
    validator.schema('updateConfig', config);
    const validConfig = validator.valid<Config>();
    const wrongConfig = validator.errors();
    if (wrongConfig) {
      errors.push({
        code: INVALID_PARAMETERS_ERROR,
        context: 'config',
        details: Object.keys(wrongConfig),
      });
    }

    /*
     * sizes validation
     */
    const validSizes = [];
    for (const size of sizes) {
      validator.schema('updatePhotoSize', size);
      const wrongSize = validator.errors();
      if (wrongSize) {
        errors.push({
          code: INVALID_PARAMETERS_ERROR,
          context: 'size',
          details: Object.keys(wrongSize),
        });
        break;
      }
      validSizes.push(validator.valid<Size>());
    }

    /*
     * admin user validation
     */
    validator.schema('updateUser', admin);
    const validUser = validator.valid<NewUser>();
    const wrongUser = validator.errors();
    if (wrongUser) {
      errors.push({
        code: INVALID_PARAMETERS_ERROR,
        context: 'user',
        details: Object.keys(wrongUser),
      });
    }

    if (admin.password) {
      if (admin.password !== admin.passwordConfirmation) {
        errors.push({
          code: PASSWORDS_DONT_MATCH_ERROR,
          context: 'user',
        });
      }
    } else {
      delete validUser.password;
    }

    /*
     * Check for errors
     */
    if (errors.length) {
      response.status(HTTP_CODE_400_BAD_REQUEST).send({ errors });
      return;
    }

    /*
     * All OK. Try to update everything
     */
    const promises = [
      updateConfig(validConfig),
      setSizes(validSizes),
    ];

    if (validUser.password || objectHasChange(oldAdmin, validUser)) {
      const userData = {
        username: validUser.username || oldAdmin.username,
        password: validUser.password,
        email: '',
        lang: validUser.lang || oldAdmin.lang,
      };
      promises.push(updateUser(ADMIN_USER_ID, userData));
    }

    return Promise.all(promises)
      .then(() => response.send())
      .catch((error) => {
        response.status(HTTP_CODE_400_BAD_REQUEST).send({
          errors: [{
            code: INTERNAL_ERROR,
            details: error,
          }],
        });
      });
  });
}
