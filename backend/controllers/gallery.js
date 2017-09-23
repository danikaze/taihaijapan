const db = require('../utils/db');
const settings = require('../utils/settings').values.gallery;

const photos = settings.maxImages ? db.photos.slice(0, settings.maxImages)
                                  : db.photos;

function index(request, response) {
  response.render('gallery', {
    bodyId: 'page-gallery',
    title: 'taihaijapan | 退廃ジャパン > Gallery',
    sizes: db.sizes,
    photos,
  });
}

module.exports = app => [{
  method: 'get',
  path: '/gallery',
  callback: index,
}];
