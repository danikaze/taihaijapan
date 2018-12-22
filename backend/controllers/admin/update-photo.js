const typify = require('../../utils/typify');
const photoSchema = require('../../models/schemas/photos');
const modelUpdatePhoto = require('../../models/gallery/update-photo');

/**
 * Receive a list of photos to update as { id: newPhotoData }
 * Return the same list with the updated data
 */
function updatePhoto(serverSettings, request, response) {
  try {
    const rawData = JSON.parse(request.query.photos);
    const promises = Object.keys(rawData).map((key) => {
      const id = Number(key);
      const photo = typify(rawData[key], photoSchema, { copy: true, includeExternal: false });
      const rawTags = rawData[key].tags;
      photo.tags = rawTags ? rawTags.split(',').map((tag) => tag.trim()).filter((tag) => tag.length > 0)
                           : [];

      return modelUpdatePhoto(id, photo);
    });

    Promise.all(promises).then((updatedPhotos) => {
      const updatedData = {};
      updatedPhotos.forEach((updatedPhoto) => {
        updatedData[updatedPhoto.id] = updatedPhoto;
      });
      response.send(updatedData);
    }).catch((error) => {
      response.status(400).send({
        error: 'Wrong data',
        data: error,
      });
    });
  } catch (error) {
    response.status(400).send('Wrong data');
  }
}

module.exports = { updatePhoto };
