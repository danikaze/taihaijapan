import { Photo } from './model';

type NewPhotoBase = Pick<Photo, 'original' | 'slug' | 'title' | 'keywords' | 'visible'>;
export interface NewPhoto extends NewPhotoBase {
  tags: string[];
}

export interface ApiErrorResponse {
  errors: Array<{
    code: string;
    context?: string;
    details?: string[];
  }>;
}
