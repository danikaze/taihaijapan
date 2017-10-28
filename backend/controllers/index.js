const db = require('../utils/db');
const settingsModel = require('../models/settings');

let settings;
let newPhotos;

function updateData() {
  settings = settingsModel.data.controllers.index;
  newPhotos = getN(db.photos, settings.maxImages);
}

function getN(arr, n) {
  return n ? arr.slice(0, n) : arr;
}

function index(request, response) {
  response.render('index', {
    fullUrl: 'https://taihaijapan.com',
    bodyId: 'page-index',
    title: 'taihaijapan | 退廃ジャパン',
    sizes: db.sizes,
    newPhotos,
  });
}

settingsModel.on('update', updateData);
updateData();

module.exports = (app) => [
  {
    method: 'get',
    path: '/',
    callback: index,
  },
];
