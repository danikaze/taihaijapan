import { Request, Response } from 'express';
import { HTTP_CODE_400_BAD_REQUEST } from '../../../constants/http';
import { typify } from '../../utils/typify';
import { splitCsv } from '../../utils/split-csv';
import { schema } from '../../models/schemas/photos';
import { NewPhoto } from '../../../interfaces/controllers';
import { updatePhoto as modelUpdatePhoto } from '../../models/gallery/update-photo';
import { ServerSettings } from '../../settings';

/**
 * Receive of photos to update as { id: newPhotoData }
 * Return the updated data
 */
export function updatePhoto(serverSettings: ServerSettings, request: Request, response: Response) {
  try {
    const id = Number(request.params.photoId);
    const photo = typify<NewPhoto>(request.body, schema, { copy: true, includeExternal: false });
    photo.tags = splitCsv(request.body.tags);

    modelUpdatePhoto(id, photo)
      .then((updatedData) => {
        response.send(updatedData);
      })
      .catch((error) => {
        response.status(HTTP_CODE_400_BAD_REQUEST).send({
          error: 'Wrong data',
          data: error,
        });
      });
  } catch (error) {
    response.status(HTTP_CODE_400_BAD_REQUEST).send('Wrong data');
  }
}
