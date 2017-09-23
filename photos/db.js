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
const baseUrl = '/public/photos';

// list of photos
const photos = (() => [
  // Golden Gai, Shinjuku / 新宿のゴールデン街
  { img: '_MG_2208-Edit', id: 'golden-gai-streets' },
  // Proyecto G-Cans / 首都圏外郭放水路
  { img: '_MG_4439-Edit', id: 'g-cans-project' },
  // Rincón Showa, Yokohama / 新横浜ラーメン博物館
  { img: '_MG_4624-Edit', id: 'showa-corner-in-yokohama' },
  // Tsukiji / 築地市場
  { img: '_MG_6313-Edit', id: 'tsukiji' },
  // Barrio Chino de Yokohama / 横浜元町中華街
  { img: '_MG_4534-Edit', id: 'motomachi-chukagai-reflexes' },
  // Callejones de Nakano / 中野の裏路地
  { img: '_MG_5923-Edit', id: 'nakano-no-uraroji' },
  // Showa Game Center, Nagano / 渋温泉の昭和っぽいゲームセンター
  { img: '_MG_5304-Edit', id: 'nagano-showa-gamecenter' },
  // Dōtonbori, Ōsaka / 道頓堀、大阪
  { img: '_MG_2768-Edit-2', id: 'osaka-dotonbori' },
  // Templo Abandonado en Nikkō / 四本龍寺
  { img: '_MG_4179-Edit', id: 'light-of-the-shrine' },
  // Distrito Comercial Nakamise / 中野新仲見世商店街
  { img: '_MG_5941-Edit', id: 'nakamise-shotengai' },
  // Bares de la Era Showa / 新横浜ラーメン博物館
  { img: '_MG_4657-Edit', id: 'showa-bars-corner' },
  // Callejones de Shinjuku / 新宿の裏路地
  { img: '_MG_2190-Edit', id: 'shinjuku-no-uraroji' },
  // Nikkō / 日光
  { img: '_MG_4205-Edit', id: 'misty-nikko' },
  // Tienda de licor, Tsumago / 妻籠宿の酒屋
  { img: '_MG_5540-Edit', id: 'tsumago-no-sakaba' },
  // Tsūtengaku, Ōsaka / 通天閣、大阪
  { img: '_MG_3035-Edit', id: 'standing-tsutengaku' },
  // Vida diaria / 日常生活
  { img: '_MG_4734-Edit', id: 'strange-nichijo' },
  // Botes de lago abandonados en Nikkō / 中禅寺湖の打ち捨てられたボート
  { img: '_MG_4222-Edit', id: 'nikko-abandoned-lake' },
  // Edificio Umeda / 梅田ビル
  { img: '_MG_3111-Edit', id: 'umeda-building-stairs-to-heaven' },
  // Matando el tiempo en Golden Gai / ゴールデン街の暇つぶし
  { img: '_MG_2245-Edit', id: 'golden-gai-hima-tsubushi' },
  // Nuka Cola / ヌカ・コーラ
  { img: '_MG_4651-Edit', id: 'nuka-cola' },
  // Pachinko / パチンコ
  { img: '_MG_9267-Edit', id: 'pachinko' },
  // Sancha en la lluvia
  { img: '_MG_9324', id: 'sancha-in-the-rain' },
])().map(photo => ({
  img: `${__dirname}/${photo.img}.jpg`,
  id: photo.id,
}));

// if `true`, each file will be renamed based on a pattern
const renameFiles = true;

// pattern to use when renaming files
// available values:
// random:#|hash:#|basename|ext|width|height|size
const renamePattern = '{hash:16}{ext}';

// where the gallery json will be generated (absolute)
// available values:
// random#|hash#|basename|ext|timestamp|size
const outputJsonPath = `${__dirname}/../backend/gallery.json`;

// where the photos will be stored (absolute)
const outputPhotosPath = `${__dirname}/../backend/public/photos/`;

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
