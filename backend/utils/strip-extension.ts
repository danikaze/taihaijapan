import { extname } from 'path';

/**
 * @param  filePath path of the file to parse
 * @return          `filePath` without extension
 */
export function stripExtension(filePath: string): string {
  const ext = extname(filePath);
  return filePath.substring(0, filePath.length - ext.length);
}
