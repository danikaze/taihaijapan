
function index(request, response) {
  response.render('gallery', {
    bodyId: 'page-gallery',
    title: 'taihaijapan | 退廃ジャパン > Gallery',
  });
}

module.exports = app => [{
  method: 'get',
  path: '/gallery',
  callback: index,
}];
