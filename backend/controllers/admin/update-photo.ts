import { Request, Response } from 'express';
import { HTTP_CODE_400_BAD_REQUEST } from '../../../constants/http';
import { typify } from '../../utils/typify';
import { splitCsv } from '../../utils/split-csv';
import { schema } from '../../models/schemas/photos';
import { NewPhoto } from '../../../interfaces/controllers';
import { updatePhoto as modelUpdatePhoto } from '../../models/gallery/update-photo';
import { ServerSettings } from '../../settings';

/**
 * Receive a list of photos to update as { id: newPhotoData }
 * Return the same list with the updated data
 */
export function updatePhoto(serverSettings: ServerSettings, request: Request, response: Response) {
  try {
    const rawData = JSON.parse(request.query.photos);
    const promises = Object.keys(rawData).map((key) => {
      const id = Number(key);
      const photo = typify<NewPhoto>(rawData[key], schema, { copy: true, includeExternal: false });
      const rawTags = rawData[key].tags;
      photo.tags = splitCsv(rawTags);

      return modelUpdatePhoto(id, photo);
    });

    Promise.all(promises).then((updatedPhotos) => {
      const updatedData = {};
      updatedPhotos.forEach((updatedPhoto) => {
        updatedData[updatedPhoto.id] = updatedPhoto;
      });
      response.send(updatedData);
    }).catch((error) => {
      response.status(HTTP_CODE_400_BAD_REQUEST).send({
        error: 'Wrong data',
        data: error,
      });
    });
  } catch (error) {
    response.status(HTTP_CODE_400_BAD_REQUEST).send('Wrong data');
  }
}
