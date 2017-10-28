const settingsModel = require('../models/settings');

let settings;

function updateData() {
  settings = settingsModel.data.controllers.admin;
}

function admin(request, response) {
  response.render('admin', {
    fullUrl: 'https://taihaijapan.com/admin',
    bodyId: 'page-admin',
    title: 'taihaijapan | 退廃ジャパン',
  });
}

settingsModel.on('update', updateData);
updateData();

module.exports = (app) => [
  {
    method: 'get',
    path: settings.route || '/admin',
    callback: admin,
  },
];
