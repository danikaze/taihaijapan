const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp').sync;

const DEFAULT_OPTIONS = {
  resizePolicy: 'inside',  // cover, contain, fill, inside or outside
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
    const resizeProcess = sharp(inputPath);
    const resizeOptions = {
      width: opt.resizePolicy === 'inside' ? (width || 10000) : (width || 1),
      height: opt.resizePolicy === 'inside' ? (height || 10000) : (height || 1),
      withoutEnlargment: opt.doNotEnlarge,
      fit: opt.resizePolicy,
    };

    resizeProcess
      .resize(resizeOptions)
      .toFormat(opt.format, opt.formatOptions)
      .toFile(outputPath, (error, info) => {
        info.input = inputPath;
        info.path = outputPath;
        resolve(info);
      });
  });
}

module.exports = resizeImage;
