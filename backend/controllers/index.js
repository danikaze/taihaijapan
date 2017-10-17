const db = require('../utils/db');
const settings = require('../utils/settings').values.index;

const photos = (() => (settings.maxImages ? db.photos.slice(0, settings.maxImages)
                                         : db.photos))();

function index(request, response) {
  response.render('index', {
    fullUrl: 'https://taihaijapan.com',
    bodyId: 'page-index',
    title: 'taihaijapan | 退廃ジャパン',
    sizes: db.sizes,
    photos,
  });
}

module.exports = (app) => [
  {
    method: 'get',
    path: '/',
    callback: index,
  },
];
