import * as multer from 'multer';
import * as path from 'path';
import { Request, Response } from 'express';
import { PATH_IMAGES_ORIGINAL } from '../../../constants/paths';
import { stripExtension } from '../../utils/strip-extension';
import { splitCsv } from '../../utils/split-csv';
import { NewPhoto } from '../../../interfaces/controllers';
import { addPhoto as modelAddPhoto } from '../../models/gallery/add-photo';
import { getConfig } from '../../models/config/get-config';
import { ServerSettings } from '../../settings';

/**
 * Resolve the filename for the original uploaded file
 */
function getUploadFilename(req, file, cb) {
  const filename = `${stripExtension(file.originalname)}-${new Date().getTime()}${path.extname(file.originalname)}`;
  cb(null, filename);
}

const uploadStorage = multer({
  storage: multer.diskStorage({
    destination: PATH_IMAGES_ORIGINAL,
    filename: getUploadFilename,
  }),
});
const upload = uploadStorage.single('photo');

/**
 * Process the request to upload a new photo
 *
 * - params: none
 * - body: `NewPhoto` (tags is a csv list of tags)
 */
export function addPhoto(serverSettings: ServerSettings, request: Request, response: Response): void {
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
      const tags = splitCsv(body.tags);

      const photo: NewPhoto = {
        tags,
        visible,
        original: request.file.path,
        title: body.title,
        slug: body.slug,
        keywords: body.keywords,
      };

      modelAddPhoto(photo).then(() => {
        response.redirect(`${routeAdmin}?newphoto`);
      }).catch((error) => {
        response.redirect(`${routeAdmin}?error=${Object.keys(error).join(',')}`);
      });
    });
  });
}
