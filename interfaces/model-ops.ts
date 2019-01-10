import { Size, Photo, User } from './model';

type NewPhotoBase = Pick<Photo, 'original' | 'slug' | 'title' | 'keywords' | 'visible'>;
export interface NewPhoto extends NewPhotoBase {
  tags: string[];
}

export type NewSize = Pick<Size, 'label' | 'width' | 'height' | 'quality'>;

export interface InsertUniqueResult {
  id: number;
  isNew: boolean;
}

export type NewUser = Pick<User, 'username' | 'password' | 'email'>;
