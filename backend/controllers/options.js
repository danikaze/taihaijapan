const bodyParser = require('body-parser');
const settingsModel = require('../models/settings');

let settings;

function updateSettings() {
  settings = settingsModel.data;
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
  },
  {
    method: 'post',
    path: `${settings.controllers.admin.route}/options`,
    callback: updateOptions,
    middleware: bodyParser.urlencoded({ extended: true }),
  },
];
