import { HTTP_CODE_400_BAD_REQUEST } from '../../../constants/http';
import { removePhotos } from '../../models/gallery/remove-photos';

/**
 * Process the request to delete a photo
 */
export function deletePhoto(serverSettings, request, response) {
  try {
    removePhotos([Number(request.params.photoId)])
      .then(() => {
        response.send();
      })
      .catch((errorData) => {
        response.status(HTTP_CODE_400_BAD_REQUEST).send({
          error: 'Wrong data',
          data: errorData,
        });
      });
  } catch (error) {
    response.status(HTTP_CODE_400_BAD_REQUEST).send(error);
  }
}
