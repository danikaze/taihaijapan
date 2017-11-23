const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp').sync;

const DEFAULT_OPTIONS = {
  resizePolicy: 'fit',  // fit|cover
  format: 'jpeg',
  formatOptions: {
    quality: 80,
  },
  doNotEnlarge: true,
};

function resizeImage(inputPath, outputPath, width, height, options) {
  const outputFolder = path.dirname(outputPath);
  if (!fs.existsSync(outputFolder)) {
    mkdirp(outputFolder);
  }

  const opt = Object.assign({}, DEFAULT_OPTIONS, options);
  return new Promise((resolve, reject) => {
    const resizeProcess = sharp(inputPath).withoutEnlargement(opt.doNotEnlarge);

    if (opt.resizePolicy === 'fit') {
      resizeProcess.resize(width || 100000, height || 100000).max();
    } else if (opt.resizePolicy === 'cover') {
      resizeProcess.resize(width || 1, height || 1).min();
    }

    resizeProcess
      .toFormat(opt.format, opt.formatOptions)
      .toFile(outputPath, (error, info) => {
        info.input = inputPath;
        info.path = outputPath;
        resolve(info);
      });
  });
}

module.exports = resizeImage;
