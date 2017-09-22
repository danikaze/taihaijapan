const db = require('../utils/db');
const settings = require('../utils/settings').values.index;

const photos = db.photos.slice(0, settings.maxImages);

function index(request, response) {
  response.render('index', {
    bodyId: 'page-index',
    title: 'taihaijapan | 退廃ジャパン',
    sizes: db.sizes,
    photos,
  });
}

module.exports = app => [{
  method: 'get',
  path: '/',
  callback: index,
}];
