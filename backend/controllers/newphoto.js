const multer = require('multer');
const path = require('path');
const Auth = require('../utils/Auth');
const settingsModel = require('../models/settings');
const galleryModel = require('../models/gallery');
const stripExtension = require('../utils/stripExtension');

const auth = new Auth();
let settings;

settingsModel.on('update', updateSettings);
updateSettings();
const uploadStorage = multer({
  storage: multer.diskStorage({
    destination: path.resolve(__dirname, '..', settingsModel.data.images.originalPath),
    filename: getUploadFilename,
  }),
});
const upload = uploadStorage.single('photo');

function updateSettings() {
  settings = settingsModel.data.controllers.admin;
  auth.setCredentials(settingsModel.data.global.user, settingsModel.data.global.password);
  auth.setRealm(settingsModel.data.global.realm);
}

function newPhoto(request, response) {
  upload(request, response, (uploadError) => {
    if (uploadError) {
      return;
    }

    if (!request.file) {
      response.redirect(`${settings.route}?error=file`);
      return;
    }

    const photo = {
      original: request.file.path,
      slug: request.body.slug,
      tags: request.body.tags,
      keywords: request.body.keywords,
    };

    galleryModel.add(photo).then(() => {
      response.redirect(settings.route);
    }).catch((error) => {
      response.redirect(`${settings.route}?error=${Object.keys(error).join(',')}`);
    });
  });
}

function getUploadFilename(req, file, cb) {
  const filename = `${stripExtension(file.originalname)}-${new Date().getTime()}${path.extname(file.originalname)}`;
  cb(null, filename);
}

module.exports = (app) => [
  {
    method: 'post',
    path: `${settings.route}/photos`,
    callback: newPhoto,
    middleware: auth.middleware(),
  },
];
