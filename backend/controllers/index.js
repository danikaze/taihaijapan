
function index(request, response) {
  response.render('index', {
    bodyId: 'page-index',
    title: 'taihaijapan | 退廃ジャパン',
    includeGallery: true,
  });
}

module.exports = app => [{
  method: 'get',
  path: '/',
  callback: index,
}];
