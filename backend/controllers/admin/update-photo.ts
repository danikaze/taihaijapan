import { Request, Response } from 'express';
import { HTTP_CODE_400_BAD_REQUEST, HTTP_CODE_404_NOT_FOUND, HTTP_CODE_500_INTERNAL_SERVER_ERROR } from '../../../constants/http';
import { INVALID_PARAMETERS_ERROR, INTERNAL_ERROR, RESOURCE_NOT_FOUND_ERROR } from '../../../constants/errors';
import { NewPhoto } from '../../../interfaces/controllers';
import { updatePhoto as modelUpdatePhoto } from '../../models/gallery/update-photo';
import { ServerSettings } from '../../settings';
import { validator } from '../../validator';

/**
 * Receive of photos to update as { id: newPhotoData }
 * Return the updated data
 */
export function updatePhoto(serverSettings: ServerSettings, request: Request, response: Response) {
  try {
    const id = Number(request.params.photoId);

    validator.schema('updatePhoto', request.body);
    if (validator.errors()) {
      response.status(HTTP_CODE_400_BAD_REQUEST).send({
        errors: [{
          code: INVALID_PARAMETERS_ERROR,
          details: Object.keys(validator.errors()),
        }],
      });
      return;
    }

    const photo = validator.valid<NewPhoto>();

    modelUpdatePhoto(id, photo).then((updatedData) => {
      response.send(updatedData);
    }).catch((error) => {
      if (error === RESOURCE_NOT_FOUND_ERROR) {
        response.status(HTTP_CODE_404_NOT_FOUND).send();
      } else {
        throw new Error(error);
      }
    });
  } catch (error) {
    response.status(HTTP_CODE_500_INTERNAL_SERVER_ERROR).send({
      errors: [{
        code: INTERNAL_ERROR,
        details: error,
      }],
    });
  }
}
