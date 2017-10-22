const db = require('../utils/db');
const settings = require('../utils/settings').values.index;

const newPhotos = getN(db.photos, settings.newImages);

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

module.exports = (app) => [
  {
    method: 'get',
    path: '/',
    callback: index,
  },
];
