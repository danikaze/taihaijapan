import * as sharp from 'sharp';
import * as path from 'path';
import { existsSync, readFile } from 'fs';
import { sync as mkdirp } from 'mkdirp';

export interface ResizeImageOptions {
  resizePolicy?: keyof sharp.FitEnum;
  format?: string;
  formatOptions?: sharp.OutputOptions;
  doNotEnlarge?: boolean;
}

export interface ResizeInfo extends sharp.OutputInfo {
  input: string;
  path: string;
}

const MAX = 10000;
const MIN = 1;

const DEFAULT_OPTIONS: ResizeImageOptions = {
  resizePolicy: 'inside',
  format: 'jpeg',
  formatOptions: {
    quality: 80,
  },
  doNotEnlarge: true,
};

export function resizeImage(
  inputPath: string,
  outputPath: string,
  width: number,
  height: number,
  options?: ResizeImageOptions): Promise<ResizeInfo> {
  const outputFolder = path.dirname(outputPath);
  if (!existsSync(outputFolder)) {
    mkdirp(outputFolder);
  }

  const opt = { ...DEFAULT_OPTIONS, ...options };
  return new Promise<ResizeInfo>((resolve, reject) => {
    // manually read the file and create the sharp object from the data instead of
    // calling sharp with the file path (https://github.com/lovell/sharp/issues/346)
    readFile(inputPath, (error, data) => {
      const resizeProcess = sharp(data);
      const resizeOptions: sharp.ResizeOptions = {
        width: opt.resizePolicy === 'inside' ? (width || MAX) : (width || MIN),
        height: opt.resizePolicy === 'inside' ? (height || MAX) : (height || MIN),
        withoutEnlargement: opt.doNotEnlarge,
        fit: opt.resizePolicy,
      };

      resizeProcess
      .resize(null, null, resizeOptions)
      .toFormat(opt.format, opt.formatOptions)
      .toFile(outputPath, (error, info) => {
        resizeProcess.end(() => {
          resolve({
            ...info,
            input: inputPath,
            path: outputPath,
          });
        });
      });
    });
  });
}
