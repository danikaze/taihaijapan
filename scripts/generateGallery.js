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
const verboseLevel = process.argv.indexOf('-q') !== -1 ? 0 : 2;
const out = new Output(verboseLevel);

const FORMAT_EXT = {
  jpeg: 'jpg',
  png: 'png',
  webp: 'webp',
  tiff: 'tiff',
};

function checkDatabase() {
  function checkDuplicatedIds() {
    const ids = [];
    const duplicatedIds = [];

    db.photos.forEach((photo) => {
      const id = photo.id.toLowerCase();
      if (ids.indexOf(id) !== -1) {
        duplicatedIds.push(photo.id);
      } else {
        ids.push(photo.id);
      }
    });

    return duplicatedIds.length ? duplicatedIds : null;
  }

  return new Promise((resolve, reject) => {
    const checks = {
      duplicatedIds: checkDuplicatedIds,
    };
    const errors = {};
    let failed = false;

    Object.keys(checks).forEach((key) => {
      const res = checks[key]();
      if (res) {
        errors[key] = res;
        failed = true;
      }
    });

    if (failed) {
      reject(errors);
    } else {
      resolve();
    }
  });
}

function getFiles() {
  return Promise.resolve(db.photos);
}

function resizeImages(photoList) {
  const allPhotosInfo = [];
  const totalPhotos = photoList.length;
  const funcs = [];
  const generatedRoutes = [];
  const fileExtension = FORMAT_EXT[db.output.format];
  const resizeOptions = {
    format: db.output.format,
    formatOptions: db.output.formatOptions,
  };

  if (!fileExtension) {
    throw new Error(`db.output.format not accepted (${db.output.format})`);
  }

  out.log(`Processing ${totalPhotos} images`);
  out.info(`Output folder: ${db.output.photosPath}`);
  out.info(`Quality: ${db.output.format} ${db.output.formatOptions.quality}%`);

  photoList.forEach((photo, index) => funcs.push(((filePath, photoId, f) => {
    if (!fs.existsSync(filePath)) {
      out.error(` ! file not found: ${filePath}`);
      return;
    }

    const promises = [];
    out.log(` [${f + 1}/${totalPhotos}] ${path.basename(filePath)} (${photoId})`);
    const currentPhotoInfo = {
      id: photoId,
      imgs: [],
    };
    allPhotosInfo.push(currentPhotoInfo);

    db.sizes.forEach((size, s) => {
      const tempName = path.join(PATH_TEMP, `${f}-${s}.${fileExtension}`);
      promises.push(resizeImage(filePath, tempName, size.w, size.h, resizeOptions)
        .then((fileInfo) => generateFileName(db.renamePattern, tempName, fileInfo)
            .then((fileName) => new Promise((renameResolve, renameReject) => {
              const newPath = path.join(db.output.photosPath, size.subdir, fileName);
              mkdirp(path.dirname(newPath));
              fileInfo.path = newPath;
              fileInfo.src = path.join(db.baseUrl, path.relative(db.output.photosPath, newPath));

              if (generatedRoutes.indexOf(fileInfo.src) !== -1) {
                out.error(`  ! Duplicated filename: ${fileInfo.src}`);
              }
              generatedRoutes.push(fileInfo.src);

              currentPhotoInfo.imgs[s] = fileInfo;
              out.info(`  - ${fileInfo.width}x${fileInfo.height} => `
                + `${fileInfo.src} (${parseInt(fileInfo.size / 1024, 10)}kb.)`);
              fs.rename(tempName, newPath, renameResolve);
            }))));
    });

    // eslint-disable-next-line
    return Q.all(promises);
  }).bind(null, photo.img, photo.id, index)));

  return async.series(funcs).then(() => allPhotosInfo);
}

function generateJson(imageData) {
  const gallery = {
    updatedOn: new Date().toISOString(),
    sizes: [],
    photos: [],
  };

  out.info('Generating json');

  db.sizes.forEach((size) => {
    gallery.sizes.push({
      w: size.w || 0,
      h: size.h || 0,
    });
  });

  imageData.forEach((photo) => {
    const imgs = [];
    photo.imgs.forEach((img) => imgs.push({
      w: img.width,
      h: img.height,
      src: img.src,
    }));
    gallery.photos.push({
      id: photo.id,
      imgs,
    });
  });

  return new Promise((resolve, reject) => {
    const tempPath = path.join(PATH_TEMP, 'db.json');
    const str = db.beautifyJson ? JSON.stringify(gallery, null, 2) : JSON.stringify(gallery);

    fs.writeFile(tempPath, str, (error) => {
      if (error) {
        reject(error);
      } else {
        generateFileName(db.output.jsonPath, tempPath).then((fileName) => {
          fs.rename(tempPath, fileName, resolve);
        });
      }
    });
  });
}

function createTempDir() {
  out.info(`Creating temporal folder (${PATH_TEMP})`);
  mkdirp(PATH_TEMP);
}

function orderSizes() {
  db.sizes.sort((a, b) => ((a.w || 0) - (b.w || 0)) + ((a.h || 0) - (b.h || 0)));
}

function clearTempDir() {
  if (!fs.existsSync(PATH_TEMP)) {
    return Promise.resolve();
  }

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

/**
 * Outputs a message and exits with an error
 * @param {string} msg
 */
function exitError(msg) {
  out.error(msg);
  out.log('Exiting...');
  return clearTempDir().then(() => {
    process.exit(1);
  });
}

/**
 * End the process and exits
 */
function end() {
  out.log('Exiting...');
  process.exit(0);
}

/**
 * Run the main tasks of the script
 */
function run() {
  createTempDir();
  orderSizes();
  getFiles()
  .then(resizeImages)
  .then(generateJson)
  .then(clearTempDir)
  .then(end)
  .catch(exitError);
}

/*
 * Execution after checks
 */
checkDatabase()
  .catch((errors) => exitError(`Errors while checking db.js: ${JSON.stringify(errors, null, 2)}`))
  .then(run);
