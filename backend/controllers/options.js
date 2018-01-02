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

settingsModel.on('update', updateSettings);
updateSettings();

module.exports = (app) => [
  {
    method: 'get',
    path: `${settings.controllers.admin.route}/options`,
    callback: displayOptions,
  },
];
