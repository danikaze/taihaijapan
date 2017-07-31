const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const async = require('async-q');
const Q = require('q');
const db = require('../photos/db');
const generateFileName = require('./util/generateFileName');
const resizeImage = require('./util/resizeImage');
const Output = require('./util/Output');

const PATH_TEMP = path.normalize('./temp/');
const verboseLevel = process.argv.reduce((sum, param) => sum + (param.toLowerCase() === '-v' ? 1 : 0), 0);
const out = new Output(verboseLevel);

function getFiles() {
  return Promise.resolve(db.photos);
}

function resizeImages(photoList) {
  const allPhotosInfo = [];
  const totalPhotos = photoList.length;
  const funcs = [];
  const generatedRoutes = [];

  out.log(`Processing ${totalPhotos} images`);
  photoList.forEach((value, index) => funcs.push(((filePath, f) => {
    const promises = [];
    out.info(` [${f + 1}/${totalPhotos}] ${path.basename(filePath)}`);
    const currentPhotoInfo = [];
    allPhotosInfo.push(currentPhotoInfo);

    db.sizes.forEach((size, s) => {
      const tempName = path.join(PATH_TEMP, `${f}-${s}.jpg`);
      promises.push(resizeImage(filePath, tempName, size.w, size.h)
        .then(fileInfo => generateFileName(db.renamePattern, tempName, fileInfo)
            .then(fileName => new Promise((renameResolve, renameReject) => {
              const newPath = path.join(db.outputPhotosPath, size.subdir, fileName);
              mkdirp(path.dirname(newPath));
              fileInfo.path = newPath;
              fileInfo.src = path.join(db.baseUrl, path.relative(db.outputPhotosPath, newPath));

              if (generatedRoutes.indexOf(fileInfo.src) !== -1) {
                out.error(`  ! Duplicated filename: ${fileInfo.src}`);
              }
              generatedRoutes.push(fileInfo.src);

              currentPhotoInfo[s] = fileInfo;
              out.info(`  - ${fileInfo.width}x${fileInfo.height} => ${fileInfo.src}`);
              fs.rename(tempName, newPath, renameResolve);
            }))));
    });

    return Q.all(promises);
  }).bind(null, value, index)));

  return async.series(funcs).then(() => allPhotosInfo);
}

function generateJson(imageData) {
  const gallery = {
    updatedOn: new Date().toISOString(),
    photos: [],
  };

  out.info('Generating json');

  imageData.forEach((photo) => {
    const imgs = [];
    photo.forEach(img => imgs.push({
      w: img.width,
      h: img.height,
      src: img.src,
    }));
    gallery.photos.push(imgs);
  });

  return new Promise((resolve, reject) => {
    const tempPath = path.join(PATH_TEMP, 'db.json');
    const str = db.beautifyJson ? JSON.stringify(gallery, null, 2) : JSON.stringify(gallery);

    fs.writeFile(tempPath, str, (error) => {
      if (error) {
        reject(error);
      } else {
        generateFileName(db.outputJsonPath, tempPath).then((fileName) => {
          fs.rename(tempPath, fileName, resolve);
        });
      }
    });
  });
}

function createTempDir() {
  out.info('Creating temporal folder');
  mkdirp(PATH_TEMP);
}

function clearTempDir() {
  return new Promise((resolve, reject) => {
    fs.rmdir(PATH_TEMP, (error) => {
      out.info('Cleaning temporal folder');
      if (error) {
        out.error('Error cleaning temporal folder');
      }
      resolve();
    });
  });
}

function end() {
  out.log('Exiting...');
  process.exit(0);
}

createTempDir();
getFiles()
  .then(resizeImages)
  .then(generateJson)
  .then(clearTempDir)
  .then(end);
