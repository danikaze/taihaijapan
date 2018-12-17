const multer = require('multer');
const path = require('path');
const auth = require('../utils/auth');
const settingsModel = require('../models/settings');
const stripExtension = require('../utils/stripExtension');
const addPhoto = require('../models/gallery/add-photo');

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

    const body = request.body;
    const visible = body.visible === undefined ? !settings['images.hiddenByDefault']
                                               : request.body.visible;
    const tags = body.tags ? body.tags.split(',').map((tag) => tag.trim()).filter((tag) => tag.length > 0)
                           : [];

    const photo = {
      original: request.file.path,
      title: body.title,
      slug: body.slug,
      tags,
      keywords: body.keywords,
      visible,
    };

    addPhoto(photo).then(() => {
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
