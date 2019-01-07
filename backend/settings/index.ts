import { LogLevels } from 'npmlog';

export interface ServerSettings {
  port: number;
  host: string;
  viewsPath: string;
  helpersPath: string;
  partialsPath: string;
  publicPath: string;
  publicUrl: string;
  adminUrl: string;
  adminRealm: string;
  passphrase: string;
  imagesOriginalPath: string;
  imagesTemporalPath: string;
  imagesThumbPath: string;
  imagesBaseUrl: string;
}

export interface DbSettings {
  path: string;
  debugMode: boolean;
}

export interface CacheSettings {
  config: number;
}

export interface LogSettings {
  logLevel: LogLevels;
  logDate: boolean;
  logRequests: 'combined' | 'common' | 'dev' | 'short' | 'tiny';
}

export interface CtlSettings {
  enabled: boolean;
  host: string;
  port: number;
  unixSocket: string;
}

export interface Settings {
  server: ServerSettings;
  db: DbSettings;
  cacheTtl: CacheSettings;
  log: LogSettings;
  ctl: CtlSettings;
}
