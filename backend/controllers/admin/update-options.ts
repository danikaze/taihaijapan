import { Request, Response } from 'express';
import { HTTP_CODE_400_BAD_REQUEST } from '../../../constants/http';
import { ERROR_PASSWORDS_DONT_MATCH } from '../../../constants/errors';
import { typify } from '../../utils/typify';
import { schema as configSchema } from '../../models/schemas/config';
import { schema as sizesSchema } from '../../models/schemas/sizes';
import { schema as userSchema } from '../../models/schemas/users';
import { updateConfig } from '../../models/config/update-config';
import { setSizes } from '../../models/gallery/set-sizes';
import { getUser } from '../../models/users/get-user';
import { updateUser } from '../../models/users/update-user';
import { Config, Size } from '../../../interfaces/model';
import { NewUser } from '../../../interfaces/model-ops';
import { Dict } from '../../../interfaces/frontend';
import { ServerSettings } from '../../settings';
import { objectHasChange } from '../../utils/object-has-change';

/**
 * Update the options in the admin page
 *
 * - body: Config
 */
export function updateOptions(serverSettings: ServerSettings, request: Request, response: Response) {
  const ADMIN_USER_ID = 1;

  getUser(ADMIN_USER_ID).then((oldAdmin) => {
    const { sizes, admin, ...config } = request.body;
    const errors = [];
    let userData: NewUser;

    const typedConfig = {
      'page.admin.reverse': false,
      'page.index.reverse': false,
      'page.gallery.reverse': false,
      'images.hiddenByDefault': false,
      ...typify<Config>(config, configSchema),
    };
    const typedSizes = sizes.map((size: Dict<string>) => typify<Size>(size, sizesSchema));
    const promises = [
      updateConfig(typedConfig),
      setSizes(typedSizes),
    ];

    if (admin.password && admin.password !== admin.passwordConfirmation) {
      delete admin.password;
      errors.push(ERROR_PASSWORDS_DONT_MATCH);
    }

    const typedUser = typify<NewUser>(admin, userSchema);
    if (admin.password || objectHasChange(oldAdmin, typedUser)) {
      userData = {
        username: typedUser.username || oldAdmin.username,
        password: typedUser.password,
        email: '',
        lang: typedUser.lang || oldAdmin.lang,
      };
      promises.push(updateUser(ADMIN_USER_ID, userData));
    }

    return Promise.all(promises)
      .then(() => response.send({ errors }))
      .catch(() => {
        response.status(HTTP_CODE_400_BAD_REQUEST).send('Wrong data');
      });
  });
}
