const db = require('../utils/db');

function index(request, response) {
  response.render('gallery', {
    bodyId: 'page-gallery',
    title: 'taihaijapan | 退廃ジャパン > Gallery',
    sizes: db.sizes,
    photos: db.photos,
  });
}

module.exports = app => [{
  method: 'get',
  path: '/gallery',
  callback: index,
}];
