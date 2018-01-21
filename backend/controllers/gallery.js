const settingsModel = require('../models/settings');
const galleryModel = require('../models/gallery');

let siteGlobalTitle;
let googleAnalyticsAccount;
let settings;
let sizes;
let photos;

function updateData() {
  siteGlobalTitle = settingsModel.data.global.title;
  googleAnalyticsAccount = settingsModel.data.global.googleAnalytics;
  settings = settingsModel.data.controllers.gallery;
  sizes = settingsModel.data.images.sizes;
  updateGallery();
}

function updateGallery() {
  photos = galleryModel.getPhotos({
    n: settings.maxImages,
    sortBy: settings.sortBy,
    reverse: settings.reverse,
    deleted: false,
  });
}

function gallery(request, response) {
  response.render('gallery', {
    fullUrl: 'https://taihaijapan.com/gallery/',
    bodyId: 'page-gallery',
    siteGlobalTitle: `${siteGlobalTitle} > Gallery`,
    googleAnalyticsAccount,
    sizes,
    photos,
  });
}

function photo(request, response) {
  const currentPhoto = request.params.slug
    && photos.filter((item) => item.slug === request.params.slug)[0];

  response.render('gallery', {
    fullUrl: `https://taihaijapan.com${request.originalUrl}`,
    bodyId: 'page-gallery',
    siteGlobalTitle: `${siteGlobalTitle} > Gallery`,
    googleAnalyticsAccount,
    photo: currentPhoto,
    photoSlug: currentPhoto && currentPhoto.slug,
    photos,
    sizes,
  });
}


settingsModel.on('update', updateData);
galleryModel.on('update', updateGallery);
updateData();

module.exports = (app) => [
  {
    method: 'get',
    path: '/gallery',
    callback: gallery,
  },
  {
    method: 'get',
    path: '/photo/:slug',
    callback: photo,
  },
];
