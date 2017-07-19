// How to resize each photo (fit|cover|resize)
const resizePolicy = 'fit';

// Different sizes to resize each photo
const sizes = [
  { w: 720, subdir: 'S' },
  { w: 1280, subdir: 'M' },
  { w: 2000, subdir: 'L' },
];

// Base url where the photos are stored
const baseUrl = '/photos';

// list of photos
const photos = `${__dirname}/*.jpg`;

// if `true`, each file will be renamed based on a pattern
const renameFiles = true;

// pattern to use when renaming files
// available values:
// random:#|hash:#|basename|ext|width|height|size
const renamePattern = '{hash:16}{ext}';

// where the gallery json will be generated (absolute)
// available values:
// random#|hash#|basename|ext|timestamp|size
const outputJsonPath = `${__dirname}/../build/photos/gallery.json`;

// where the photos will be stored (absolute)
const outputPhotosPath = `${__dirname}/../build/photos/`;

module.exports = {
  resizePolicy,
  baseUrl,
  sizes,
  photos,
  renameFiles,
  renamePattern,
  outputJsonPath,
  outputPhotosPath,
};
