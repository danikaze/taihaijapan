const db = require('../utils/db');
const settings = require('../utils/settings').values.gallery;

const photos = settings.maxImages ? db.photos.slice(0, settings.maxImages)
                                  : db.photos;

function gallery(request, response) {
  response.render('gallery', {
    bodyId: 'page-gallery',
    title: 'taihaijapan | 退廃ジャパン > Gallery',
    sizes: db.sizes,
    photos,
  });
}

function photo(request, response) {
  response.render('gallery', {
    bodyId: 'page-gallery',
    title: 'taihaijapan | 退廃ジャパン > Gallery',
    sizes: db.sizes,
    photos,
    photoId: request.params.id,
  });
}

module.exports = app => [
  {
    method: 'get',
    path: '/gallery',
    callback: gallery,
  },
  {
    method: 'get',
    path: '/photo/:id',
    callback: photo,
  },
];
