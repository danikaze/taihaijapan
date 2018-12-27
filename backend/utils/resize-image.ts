import * as sharp from 'sharp';
import * as path from 'path';
import { existsSync } from 'fs';
import { sync as mkdirp } from 'mkdirp';

export interface ResizeInfo extends sharp.OutputInfo {
  input: string;
  path: string;
}

const DEFAULT_OPTIONS = {
  resizePolicy: 'inside',  // cover, contain, fill, inside or outside
  format: 'jpeg',
  formatOptions: {
    quality: 80,
  },
  doNotEnlarge: true,
};

export function resizeImage(inputPath, outputPath, width, height, options): Promise<ResizeInfo> {
  const outputFolder = path.dirname(outputPath);
  if (!existsSync(outputFolder)) {
    mkdirp(outputFolder);
  }

  const opt = { ...DEFAULT_OPTIONS, ...options };
  return new Promise<ResizeInfo>((resolve, reject) => {
    const resizeProcess = sharp(inputPath);
    const resizeOptions: sharp.ResizeOptions = {
      width: opt.resizePolicy === 'inside' ? (width || 10000) : (width || 1),
      height: opt.resizePolicy === 'inside' ? (height || 10000) : (height || 1),
      withoutEnlargement: opt.doNotEnlarge,
      fit: opt.resizePolicy,
    };

    resizeProcess
      .resize(null, null, resizeOptions)
      .toFormat(opt.format, opt.formatOptions)
      .toFile(outputPath, (error, info) => {
        resolve({
          ...info,
          input: inputPath,
          path: outputPath,
        });
      });
  });
}
