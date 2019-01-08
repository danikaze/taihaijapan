import { readFileSync } from 'fs';

/**
 * @param  filePath file to read. If no extension is specified, it appends `.json` automatically
 * @return          JSON object
 */
export function readJsonSync<T = {}>(filePath: string): T {
  const data = readFileSync(filePath);
  return JSON.parse(data.toString());
}
