const path = require('path');
const readJsonSync = require('./readJsonSync');

const relativePath = path.relative(process.cwd(), __dirname);
const db = readJsonSync(path.join(relativePath, '../gallery.json'));

module.exports = db;
