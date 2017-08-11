const path = require('path');

// How to resize each photo (fit|cover|resize)
const resizePolicy = 'fit';

// Different sizes to resize each photo
const sizes = [
  { w: 400, subdir: 'T' },
  { w: 720, subdir: 'S' },
  { w: 1280, subdir: 'M' },
  { w: 2000, subdir: 'L' },
];

// Base URL (relative to the site domain) where the photos are stored
const baseUrl = '/photos';

// list of photos
const photos = (() => [
  '_MG_2208-Edit',   // Golden Gai, Shinjuku / 新宿のゴールデン街
  '_MG_4439-Edit',   // Proyecto G-Cans / 首都圏外郭放水路
  '_MG_4624-Edit',   // Rincón Showa, Yokohama / 新横浜ラーメン博物館
  '_MG_6313-Edit',   // Tsukiji / 築地市場
  '_MG_4534-Edit',   // Barrio Chino de Yokohama / 横浜元町中華街
  '_MG_5923-Edit',   // Callejones de Nakano / 中野の裏路地
  '_MG_5304-Edit',   // Showa Game Center, Nagano / 渋温泉の昭和っぽいゲームセンター
  '_MG_2768-Edit-2', // Dōtonbori, Ōsaka / 道頓堀、大阪
  '_MG_4179-Edit',   // Templo Abandonado en Nikkō / 四本龍寺
  '_MG_5941-Edit',   // Distrito Comercial Nakamise / 中野新仲見世商店街
  '_MG_4657-Edit',   // Bares de la Era Showa / 新横浜ラーメン博物館
  '_MG_2190-Edit',   // Callejones de Shinjuku / 新宿の裏路地
  '_MG_4205-Edit',   // Nikkō / 日光
  '_MG_5540-Edit',   // Tienda de licor, Tsumago / 妻籠宿の酒屋
  '_MG_3035-Edit',   // Tsūtengaku, Ōsaka / 通天閣、大阪
  '_MG_4734-Edit',   // Vida diaria / 日常生活
  '_MG_4222-Edit',   // Botes de lago abandonados en Nikkō / 中禅寺湖の打ち捨てられたボート
  '_MG_3111-Edit',   // Edificio Umeda / 梅田ビル
  '_MG_2245-Edit',   // Matando el tiempo en Golden Gai / ゴールデン街の暇つぶし
  '_MG_4651-Edit',   // Nuka Cola / ヌカ・コーラ
])().map(photo => `${__dirname}/${photo}.jpg`);

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

// if `true`, it will format the JSON file
const beautifyJson = true;

module.exports = {
  resizePolicy,
  baseUrl,
  sizes,
  photos,
  renameFiles,
  renamePattern,
  outputJsonPath: path.normalize(outputJsonPath),
  outputPhotosPath: path.normalize(outputPhotosPath),
  beautifyJson,
};
