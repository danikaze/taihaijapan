const db = require('../utils/db');
const settingsModel = require('../models/settings');

let settings;
let photos;

function updateData() {
  settings = settingsModel.data.controllers.gallery;
  photos = settings.maxImages ? db.photos.slice(0, settings.maxImages)
                              : db.photos;
}

function gallery(request, response) {
  response.render('gallery', {
    fullUrl: 'https://taihaijapan.com/gallery/',
    bodyId: 'page-gallery',
    title: 'taihaijapan | 退廃ジャパン > Gallery',
    sizes: db.sizes,
    photos,
  });
}

function photo(request, response) {
  const currentPhoto = request.params.id
    && db.photos.filter((item) => item.id === request.params.id)[0];

  response.render('gallery', {
    fullUrl: `https://taihaijapan.com${request.originalUrl}`,
    bodyId: 'page-gallery',
    title: 'taihaijapan | 退廃ジャパン > Gallery',
    sizes: db.sizes,
    photo: currentPhoto,
    photoId: currentPhoto && currentPhoto.id,
    photos,
  });
}


settingsModel.on('update', updateData);
updateData();

module.exports = (app) => [
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
