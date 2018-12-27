
function snsCardPhoto(photo) {
  if (photo) {
    return `https://taihaijapan.com${photo.imgs[1].src}`;
  }
  return 'https://taihaijapan.com/public/img/logo.jpg';
}

export default {
  fn: snsCardPhoto,
  async: false,
};
