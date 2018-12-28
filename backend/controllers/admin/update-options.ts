import { typify } from '../../utils/typify';
import { schema as configSchema } from '../../models/schemas/config';
import { schema as sizesSchema } from '../../models/schemas/sizes';
import { updateConfig } from '../../models/config/update-config';
import { setSizes } from '../../models/gallery/set-sizes';
import { updateUser } from '../../models/users/update-user';

/**
 * Update the options in the admin page
 *
 * @param {*} request
 * @param {*} response
 */
export function updateOptions(serverSettigs, request, response) {
  const { sizes, admin, ...config } = request.body;

  const typedConfig = {
    'page.admin.reverse': false,
    'page.index.reverse': false,
    'page.gallery.reverse': false,
    'images.hiddenByDefault': false,
    ...typify(config, configSchema),
  };
  const typedSizes = sizes.map((size) => typify(size, sizesSchema));
  const promises = [
    updateConfig(typedConfig),
    setSizes(typedSizes),
  ];

  if (admin.password && admin.password === admin.passwordConfirmation) {
    promises.push(updateUser(admin.id, admin));
  }

  const routeConfig = `${serverSettigs.adminUrl}/options`;
  Promise.all(promises)
    .then(() => response.redirect(routeConfig))
    .catch(() => response.redirect(`${routeConfig}?error`));
}