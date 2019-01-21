-- config
INSERT INTO config(name, value) VALUES
  -- internal
  ('schema.version', '0'),
  -- global
  ('site.title', 'My photo gallery'),
  ('site.baseUrl', 'http://localhost'),
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
  ('images.hiddenByDefault', 'true');

-- image sizes
INSERT INTO sizes(label, width, height, quality) VALUES
  ('T', 400, 0, 60),
  ('S', 720, 0, 80),
  ('M', 1280, 0, 80),
  ('L', 2000, 0, 80);
