const { existsSync, readdirSync, statSync } = require('fs');
const { join, extname } = require('path');

/**
 * Recursively get all the files (not directories) inside all the directories of the specified path
 *
 * @param startPath path to start looking for files recursively
 * @param ext if specified ('.' included), only the files with this extension will be returned
 * @return list of all matched files, or `[]` if nothing found
 */
export function getAllFiles(startPath: string, ext?: string): string[] {
  const res = [];

  if (!existsSync(startPath)) {
    return res;
  }

  const files = readdirSync(startPath);
  files.forEach((filename) => {
    const filepath = join(startPath, filename);
    const stat = statSync(filepath);
    if (stat.isDirectory()) {
      res.push.apply(res, getAllFiles(filepath));
    } else if (!ext || extname(filename) === ext) {
      res.push(filepath);
    }
  });

  return res;
}
