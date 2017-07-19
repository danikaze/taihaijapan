const sharp = require('sharp');

const DEFAULT_OPTIONS = {
  resizePolicy: 'fit',  // fit|cover
};

const resizePolicyMap = {
  fit: ['max'],
  cover: ['min'],
};

function resizeImage(inputPath, outputPath, width, height, options) {
  const opt = Object.assign({}, DEFAULT_OPTIONS, options);
  return new Promise((resolve, reject) => {
    const resizeProcess = sharp(inputPath)
      .resize(width, height);

    const ops = resizePolicyMap[opt.resizePolicy];
    ops.forEach(op => resizeProcess[op]());

    resizeProcess
      .toFormat('jpeg')
      .jpeg({
        quality: 100,
      })
      .toFile(outputPath, (error, info) => {
        info.input = inputPath;
        info.path = outputPath;
        resolve(info);
      });
  });
}

module.exports = resizeImage;
