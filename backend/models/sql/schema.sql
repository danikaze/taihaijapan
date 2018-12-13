-- Site settings
CREATE TABLE IF NOT EXISTS settings (
  name text NOT NULL,
  value text NOT NULL,
  updated text NOT NULL DEFAULT (datetime('now', 'utc'))
);

-- Users
CREATE TABLE IF NOT EXISTS users (
  id integer NOT NULL PRIMARY KEY,
  created text NOT NULL DEFAULT (datetime('now', 'utc')),
  updated text NOT NULL DEFAULT (datetime('now', 'utc')),
  username text NOT NULL UNIQUE,
  password text NOT NULL,
  email text NOT NULL DEFAULT ''
);

-- Thumbnail sizes to generate for each image
CREATE TABLE IF NOT EXISTS sizes (
  id integer NOT NULL PRIMARY KEY,
  label text NOT NULL UNIQUE,
  width integer NOT NULL,
  height integer NOT NULL,

  UNIQUE(width, height) ON CONFLICT IGNORE
);

-- Tags used in the gallery
CREATE TABLE IF NOT EXISTS tags (
  id integer NOT NULL PRIMARY KEY,
  text text NOT NULL UNIQUE ON CONFLICT IGNORE
);

-- Photos of the gallery and their information
CREATE TABLE IF NOT EXISTS photos (
  id integer NOT NULL PRIMARY KEY,
  created text NOT NULL DEFAULT (datetime('now', 'utc')),
  updated text NOT NULL DEFAULT (datetime('now', 'utc')),
  original text NOT NULL,
  slug text NOT NULL,
  title text NOT NULL,
  keywords text NOT NULL,
  visible integer NOT NULL
);

-- Generated thumbnails images for each photo
CREATE TABLE IF NOT EXISTS images (
  id integer NOT NULL PRIMARY KEY,
  photo_id integer NOT NULL,
  width integer NOT NULL,
  height integer NOT NULL,
  src text NOT NULL,

  FOREIGN KEY (photo_id) REFERENCES photos(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

-- N:M Relationship between photos and tags
CREATE TABLE IF NOT EXISTS rel_photos_tags (
  photo_id integer NOT NULL,
  tag_id integer NOT NULL,

  UNIQUE(photo_id, tag_id) ON CONFLICT IGNORE,
  FOREIGN KEY (photo_id) REFERENCES photos(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_auth ON users(username, password);
CREATE INDEX IF NOT EXISTS idx_config_name ON config(name);
CREATE INDEX IF NOT EXISTS idx_photos_created ON photos(created);
CREATE INDEX IF NOT EXISTS idx_photos_updated ON photos(updated);
CREATE INDEX IF NOT EXISTS idx_photos_slug ON photos(slug);
CREATE INDEX IF NOT EXISTS idx_photos_visible ON photos(visible);
CREATE INDEX IF NOT EXISTS idx_images_photo_id ON images(photo_id);
CREATE INDEX IF NOT EXISTS idx_rel_photos_tags_photo_id ON rel_photos_tags(photo_id);
CREATE INDEX IF NOT EXISTS idx_rel_photos_tags_tag_id ON rel_photos_tags(tag_id);
