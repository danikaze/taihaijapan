import { readFileSync } from 'fs';

/**
 * @param  {string} filePath file to read. If no extension is specified, it appends `.json` automatically
 * @return {object}          JSON object
 */
export function readJsonSync(filePath) {
  const data = readFileSync(filePath);
  return JSON.parse(data.toString());
}
