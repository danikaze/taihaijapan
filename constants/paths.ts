import { join } from 'path';

const base = join(__dirname, '..', 'backend');
const data = join(base, 'data');

export const PATH_SETTINGS = join(base, 'settings');

/* Model definition paths */
export const PATH_MODEL_INIT = join(base, 'models', 'sql');
export const PATH_MODEL_UPDATES = join(base, 'models', 'updates');

/* Handlebars paths */
export const PATH_HBS_VIEWS = join(base, 'views');
export const PATH_HBS_I18N = join(base, 'views', 'i18n');
export const PATH_HBS_PARTIALS = join(base, 'views', 'partials');
export const PATH_HBS_HELPERS = join(base, 'views', 'helpers');

export const PATH_PUBLIC = join(base, 'public');

export const PATH_IMAGES_ORIGINAL = join(data, 'photos');
export const PATH_IMAGES_TEMP = join(data, 'temp');
export const PATH_IMAGES_THUMBS = join(PATH_PUBLIC, 'photos');

export const URL_PUBLIC = '/public';
export const URL_IMAGES_BASE = `${URL_PUBLIC}/photos`;
