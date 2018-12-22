const typify = require('../../utils/typify');
const configSchema = require('../../models/schemas/config');
const sizesSchema = require('../../models/schemas/sizes');
const updateConfig = require('../../models/config/update-config');
const setSizes = require('../../models/gallery/set-sizes');
const updateUser = require('../../models/users/update-user');

/**
 * Update the options in the admin page
 *
 * @param {*} request
 * @param {*} response
 */
function updateOptions(serverSettigs, request, response) {
  const { sizes, admin, ...config } = request.body;
  const quality = Number(config['images.resize.formatOptions.quality']);
  if (quality) {
    config['images.resize.formatOptions'] = `{ "quality": ${quality} }`;
    delete config['images.resize.formatOptions.quality'];
  }

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

module.exports = { updateOptions };
