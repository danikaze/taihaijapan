const multer = require('multer');
const path = require('path');
const auth = require('../utils/auth');
const stripExtension = require('../utils/stripExtension');
const addPhoto = require('../models/gallery/add-photo');
const getConfig = require('../models/config/get-config').getConfig;

let routeAdmin;
let upload;

/**
 * Process the request to upload a new photo
 */
function newPhoto(request, response) {
  upload(request, response, (uploadError) => {
    if (uploadError) {
      return;
    }

    if (!request.file) {
      response.redirect(`${routeAdmin}?error=file`);
      return;
    }

    getConfig().then((config) => {
      const body = request.body;
      const visible = body.visible === undefined ? !config['images.hiddenByDefault']
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
        response.redirect(`${routeAdmin}?newphoto`);
      }).catch((error) => {
        response.redirect(`${routeAdmin}?error=${Object.keys(error).join(',')}`);
      });
    });
  });
}

/**
 * Resolve the filename for the original uploaded file
 */
function getUploadFilename(req, file, cb) {
  const filename = `${stripExtension(file.originalname)}-${new Date().getTime()}${path.extname(file.originalname)}`;
  cb(null, filename);
}

module.exports = (app, serverSettings, config) => {
  routeAdmin = serverSettings.adminUrl;

  const uploadStorage = multer({
    storage: multer.diskStorage({
      destination: path.resolve(__dirname, '..', config['images.originalPath']),
      filename: getUploadFilename,
    }),
  });
  upload = uploadStorage.single('photo');

  return [
    {
      method: 'post',
      path: `${routeAdmin}/photos`,
      callback: newPhoto,
      middleware: auth.middleware(),
    },
  ];
};
