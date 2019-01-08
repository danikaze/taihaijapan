
function snsCardPhoto(photo) {
  if (photo) {
    return `https://taihaijapan.com${photo.imgs[1].src}`;
  }
  return 'https://taihaijapan.com/public/img/logo.jpg';
}

export const helper = {
  fn: snsCardPhoto,
  async: false,
};
