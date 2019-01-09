import { Photo } from './model';

type NewPhotoBase = Pick<Photo, 'original' | 'slug' | 'title' | 'keywords' | 'visible'>;
export interface NewPhoto extends NewPhotoBase {
  tags: string[];
}
