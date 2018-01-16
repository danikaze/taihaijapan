const bodyParser = require('body-parser');
const Auth = require('../utils/Auth');
const settingsModel = require('../models/settings');

const auth = new Auth();
let settings;

function updateSettings() {
  settings = settingsModel.data;
  auth.setCredentials(settings.global.user, settings.global.password);
  auth.setRealm(settings.global.realm);
}

function displayOptions(request, response) {
  response.render('admin-options', {
    fullUrl: `https://taihaijapan.com${settings.controllers.admin.route}/options`,
    bodyId: 'page-admin-options',
    siteGlobalTitle: settings.global.title,
    routeAdmin: settings.controllers.admin.route,
    routeOptions: `${settings.controllers.admin.route}/options`,
    options: settings,
  });
}

function updateOptions(request, response) {
  settingsModel.update(request.body)
    .then(() => response.redirect(`${settings.controllers.admin.route}/options`))
    .catch(() => response.redirect(`${settings.controllers.admin.route}/options?error`));
}

settingsModel.on('update', updateSettings);
updateSettings();

module.exports = (app) => [
  {
    method: 'get',
    path: `${settings.controllers.admin.route}/options`,
    callback: displayOptions,
    middleware: auth.middleware(),
  },
  {
    method: 'post',
    path: `${settings.controllers.admin.route}/options`,
    callback: updateOptions,
    middleware: [auth.middleware(), bodyParser.urlencoded({ extended: true })],
  },
];
