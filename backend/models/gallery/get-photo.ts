import { log } from '../../utils/log';
import { model } from '../index';
import { Photo } from '../interfaces';
/**
 * Return all the information of the photo with the specified id
 */
export function getPhoto(id: number): Promise<Photo> {
  return model.ready.then(({ stmt }) => new Promise<Photo>((resolve, reject) => {
    const photoData: Photo = {} as Photo;
    let leftStmt = 3;

    function checkDone() {
      leftStmt--;
      if (leftStmt === 0) {
        resolve(photoData);
      }
    }

    const stmtParams = [Number(id)];

    // get basic photo data
    stmt.selectPhoto.get(stmtParams, (error, row) => {
      if (error) {
        log.error('sqlite: getPhoto.basic', error.message);
        reject(error);
      }

      Object.assign(photoData, row);
      photoData.visible = !!photoData.visible;
      checkDone();
    });

    // get tags
    stmt.selectTagsByPhoto.all(stmtParams, (error, rows) => {
      if (error) {
        log.error('sqlite: getPhoto.tags', error.message);
        reject(error);
      }

      photoData.tags = rows ? rows.map((tag) => tag.text) : [];
      checkDone();
    });

    // get images
    stmt.getImageSrcs.all(stmtParams, (error, rows) => {
      if (error) {
        log.error('sqlite: getPhoto.images', error.message);
        reject(error);
        return;
      }

      photoData.imgs = rows || [];
      checkDone();
    });
  }));
}
