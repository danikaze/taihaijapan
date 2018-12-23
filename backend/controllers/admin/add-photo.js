const multer = require('multer');
const path = require('path');
const stripExtension = require('../../utils/stripExtension');
const modelAddPhoto = require('../../models/gallery/add-photo').addPhoto;
const getConfig = require('../../models/config/get-config').getConfig;

let upload;

/**
 * Resolve the filename for the original uploaded file
 */
function getUploadFilename(req, file, cb) {
  const filename = `${stripExtension(file.originalname)}-${new Date().getTime()}${path.extname(file.originalname)}`;
  cb(null, filename);
}

/**
 * Process the request to upload a new photo
 */
function addPhoto(serverSettings, request, response) {
  getConfig().then((config) => {
    const routeAdmin = serverSettings.adminUrl;

    upload(request, response, (uploadError) => {
      if (uploadError || !request.file) {
        response.redirect(`${routeAdmin}?error=file`);
        return;
      }

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

      modelAddPhoto(photo).then(() => {
        response.redirect(`${routeAdmin}?newphoto`);
      }).catch((error) => {
        response.redirect(`${routeAdmin}?error=${Object.keys(error).join(',')}`);
      });
    });
  });
}

/**
 * Set the proper parameters based on the server settings
 */
function init(serverSettings) {
  const uploadStorage = multer({
    storage: multer.diskStorage({
      destination: serverSettings.imagesOriginalPath,
      filename: getUploadFilename,
    }),
  });
  upload = uploadStorage.single('photo');
}

module.exports = {
  init,
  addPhoto,
};
