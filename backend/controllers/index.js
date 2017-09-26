const db = require('../utils/db');
const settings = require('../utils/settings').values.index;

const photos = (() => {
  const reversedPhotos = db.photos.slice();
  reversedPhotos.reverse();

  return settings.maxImages ? reversedPhotos.slice(0, settings.maxImages)
                            : reversedPhotos;
})();

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
