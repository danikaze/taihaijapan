-- users
INSERT INTO users(username, password) VALUES
  ('admin', '1234');

-- config
INSERT INTO config(name, value) VALUES
  -- internal
  ('schema.version', '0'),
  -- global
  ('site.title', 'My photo gallery'),
  ('site.baseUrl', 'https://taihaijapan.com'),
  ('google.analytics', ''),
  -- page.admin
  ('page.admin.imagesPerPage', '50'),
  ('page.admin.orderBy', 'created'),
  ('page.admin.reverse', 'true'),
  -- page.index
  ('page.index.maxImages', '5'),
  ('page.index.orderBy', 'created'),
  ('page.index.reverse', 'true'),
  -- page.gallery
  ('page.gallery.imagesPerPage', '20'),
  ('page.gallery.orderBy', 'created'),
  ('page.gallery.reverse', 'true'),
  -- images
  ('images.hiddenByDefault', 'true'),
  -- images.paths
  ('images.originalPath', 'data/photos'),
  ('images.temporalPath', 'data/temp'),
  ('images.path', 'public/photos'),
  ('images.baseUrl', '/public/photos'),
  -- images.resize
  ('images.resize.policy', 'inside'),
  ('images.resize.outputFile', '{id:3}/{size}-{hash:16}.jpg'),
  ('images.resize.format', 'jpeg'),
  ('images.resize.formatOptions', '{ "quality": 80 }');

-- image sizes
INSERT INTO sizes(label, width, height) VALUES
  ('T', 400, 0),
  ('S', 720, 0),
  ('M', 1280, 0),
  ('L', 2000, 0);
