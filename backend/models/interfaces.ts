export interface Config {
  // internal
  'schema.version': number,
  'config.cache': number,
  // global
  'site.title': string,
  'site.realm': string,
  'google.analytics': string,
  // page.admin
  'page.admin.route': string,
  'page.admin.imagesPerPage': number,
  'page.admin.orderBy': string,
  'page.admin.reverse': boolean,
  // page.index
  'page.index.maxImages': number,
  'page.index.orderBy': string,
  'page.index.reverse': boolean,
  // page.gallery
  'page.gallery.imagesPerPage': number,
  'page.gallery.orderBy': string,
  'page.gallery.reverse': boolean,
  // images
  'images.hiddenByDefault': boolean,
  'images.resize.quality': number,
}

export interface Tag {
  id?: number;
  text: string;
}

export interface Image {
  src: string;
  width: number;
  height: number;
}

export interface Photo {
  id?: number;
  created: string;
  updated: string;
  original: string;
  slug: string;
  title: string;
  keywords: string;
  visible: boolean;
  tags: Tag[];
  imgs: Image[];
}

export interface Size {
  id: number;
  label: Text;
  width: number;
  height: number;
  quality?: number;
}