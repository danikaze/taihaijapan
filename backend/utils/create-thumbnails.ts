import { existsSync, renameSync } from 'fs';
import * as path from 'path';
import { sync as mkdirp } from 'mkdirp';

import { generateFileName } from './generate-file-name';
import { resizeImage } from './resize-image';

/**
 * Get a photo data with the path to the original image, and create thumbnails resizing and
 * storing them in the adecuate folders, returning a Promise resolved to an array of thumbnail data
 * @returns {Promise<Array<object>>}
 */
export function createThumbnails(data, options) {
  return new Promise((resolve, reject) => {
    const thumbs = [];
    let remainingSizes = options.sizes.length;

    options.sizes.forEach((size, sizeIndex) => {
      const tempNameTemplate = path.resolve(
        __dirname,
        '..',
        `${options.temporalPath}/{random}${path.extname(data.original)}`,
      );
      generateFileName(tempNameTemplate, data.original).then((resizeTargetPath) => {
        const resizeOptions = { formatOptions: { quality: size.quality } };
        resizeImage(data.original, resizeTargetPath, size.width, size.height, resizeOptions)
          .then((thumbInfo) => {
            const replaceValues = {
              id: data.id,
              slug: data.slug,
              size: size.label,
            };
            generateFileName(options.resize.outputFile, thumbInfo.path, replaceValues)
            .then((outputFile) => {
              const outputPath = path.resolve(__dirname, '..', path.join(options.path, outputFile));
              const outputFolder = path.dirname(outputPath);
              if (!existsSync(outputFolder)) {
                mkdirp(outputFolder);
              }

              renameSync(resizeTargetPath, outputPath);
              thumbs[sizeIndex] = {
                width: thumbInfo.width,
                height: thumbInfo.height,
                src: path.join(options.baseUrl, outputFile),
              };

              remainingSizes--;
              if (remainingSizes === 0) {
                resolve(thumbs);
              }
            });
          });
      });
    });
  });
}
