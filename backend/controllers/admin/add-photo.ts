import * as multer from 'multer';
import * as path from 'path';
import { stripExtension } from '../../utils/strip-extension';
import { addPhoto as modelAddPhoto } from '../../models/gallery/add-photo';
import { getConfig } from '../../models/config/get-config';

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
export function addPhoto(serverSettings, request, response) {
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
export function init(serverSettings) {
  const uploadStorage = multer({
    storage: multer.diskStorage({
      destination: serverSettings.imagesOriginalPath,
      filename: getUploadFilename,
    }),
  });
  upload = uploadStorage.single('photo');
}
