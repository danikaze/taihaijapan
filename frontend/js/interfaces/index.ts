import {
  Size,
  Photo,
  Image,
} from '../../../backend/models/interfaces';

/** Generic indexed object of the specified type T */
export interface Dict<T> {
  [key: string]: T;
}

/** Available space for a image */
export interface Viewport {
  x: number;
  y: number;
}

/** Size of a image */
export type Size = Pick<Size, 'id' | 'label' | 'width' | 'height'>;

/** Photo definition */
type BasePublicPhoto = Pick<Photo, 'id' | 'title' | 'slug' | 'imgs'>;
export interface PublicPhoto extends BasePublicPhoto {
  tags: string[];
}

/** Photo definition in admin page */
type BaseAdminPhoto = Pick<Photo, 'id' | 'created' | 'updated' | 'slug' | 'title' | 'keywords' | 'visible' | 'imgs'>;
export interface AdminPhoto extends BaseAdminPhoto {
  tags: string[];
}

export type Image = Image;
