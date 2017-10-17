const path = require('path');
const mkdirp = require('mkdirp');
const Output = require('./util/Output');
const readJsonSync = require('../backend/utils/readJsonSync');
const Handlebars = require('./util/Handlebars');

const GALLERY_PATH = path.resolve(__dirname, '../backend/gallery.json');
const AMP_PATH = path.resolve(__dirname, '../backend/public/amp');
const HBS_HELPERS_PATH = path.resolve(__dirname, './amp/helpers');
const HBS_PARTIALS_PATH = path.resolve(__dirname, './amp/partials');
const HBS_VIEWS_PATH = path.resolve(__dirname, './amp');
const verboseLevel = process.argv.indexOf('-q') !== -1 ? 0 : 2;
const out = new Output(verboseLevel);

function createOutputFolder() {
  return new Promise((resolve, reject) => {
    mkdirp(AMP_PATH, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Read the gallery json
 *
 * @returns {object}
 */
function getGallery() {
  return new Promise((resolve, reject) => {
    try {
      const json = readJsonSync(GALLERY_PATH);
      resolve(json);
    } catch (e) {
      reject('Error reading gallery file. Try running yarn:gallery first.');
    }
  });
}

/**
 * Generate the AMP pages
 *
 * @param {object} gallery Generated gallery as output from `generateGallery` script
 */
function generateAmpPages(gallery) {
  const hbs = new Handlebars();
  return hbs.initialize({
    views: HBS_VIEWS_PATH,
    partials: HBS_PARTIALS_PATH,
    helpers: HBS_HELPERS_PATH,
  }).then((views) => {
    const sizes = gallery.sizes;
    gallery.photos.forEach((photo) => {
      out.info(`Generating AMP for ${photo.id}`);
      const outputPath = path.join(AMP_PATH, `${photo.id}.html`);
      views.renderToFileSync('photo', outputPath, { photo, sizes });
    });
  });
}

/**
 * Outputs a message and exits with an error
 * @param {string} msg
 */
function exitError(msg) {
  out.error(msg);
  out.log('Exiting...');
}

/**
 * End the process and exits
 */
function end() {
  out.log('Exiting...');
  process.exit(0);
}

/**
 * Run the main tasks of the script
 */
function run() {
  createOutputFolder()
    .then(getGallery)
    .then(generateAmpPages)
    .then(end)
    .catch(exitError);
}

run();
