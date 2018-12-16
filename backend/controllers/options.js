const bodyParser = require('body-parser');
const auth = require('../utils/auth');
const settingsModel = require('../models/settings');
const getConfig = require('../models/config/get-config').getConfig;
const updateConfig = require('../models/config/update-config');
const invalidateCache = require('../models/config/get-config').invalidateCache;
const schema = require('../models/config/config-schema');
const getSizes = require('../models/gallery/get-sizes');
const setSizes = require('../models/gallery/set-sizes');
const getUsers = require('../models/users/get-users');
const updateUser = require('../models/users/update-user');
const typify = require('../utils/typify');

let routeAdmin;
let routeConfig;

function displayOptions(request, response) {
  const promises = [
    getConfig(),
    getSizes(),
    getUsers(),
  ];
  Promise.all(promises).then(([config, sizes, users]) => {
    config['images.resize.formatOptions.quality'] = config['images.resize.formatOptions'].quality;
    response.render('admin-options', {
      fullUrl: `${config['site.baseUrl']}${routeConfig}`,
      bodyId: 'page-admin-options',
      siteGlobalTitle: config['site.title'],
      routeAdmin,
      routeConfig,
      admin: {
        id: users[0].id,
        username: users[0].username,
        email: users[0].email,
      },
      config,
      sizes,
    });
  });
}

function updateOptions(request, response) {
  const { sizes, admin, ...config } = request.body;
  const quality = Number(config['images.resize.formatOptions.quality']);
  if (quality) {
    config['images.resize.formatOptions'] = `{ "quality": ${quality} }`;
    delete config['images.resize.formatOptions.quality'];
  }

  const typedConfig = typify(config, schema);
  const promises = [
    updateConfig(typedConfig),
    setSizes(sizes),
    updateUser(admin.id, admin),
  ];

  Promise.all(promises)
    .then(() => response.redirect(routeConfig))
    .catch(() => response.redirect(`${routeConfig}?error`));
}

settingsModel.on('update', invalidateCache);

module.exports = (app, serverSettings, config) => {
  routeAdmin = serverSettings.adminUrl;
  routeConfig = `${routeAdmin}/options`;

  return [
    {
      method: 'get',
      path: routeConfig,
      callback: displayOptions,
      middleware: auth.middleware(),
    },
    {
      method: 'post',
      path: routeConfig,
      callback: updateOptions,
      middleware: [auth.middleware(), bodyParser.urlencoded({ extended: true })],
    },
  ];
};
