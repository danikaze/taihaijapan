import { LogLevels } from 'npmlog';

export interface ServerSettings {
  /** port to use for the server */
  port: number;
  /** host to use for the server */
  host: string;
  /** url to use for the admin control panel */
  adminUrl: string;
  /** realm to use for admin auth */
  adminRealm: string;
}

export interface DbSettings {
  path: string;
  debugMode: boolean;
}

export interface CacheSettings {
  config: number;
}

export interface InitialUserSettings {
  username: string;
  password: string;
  email: string;
  lang: string;
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
  initialUser: InitialUserSettings;
  log: LogSettings;
  ctl: CtlSettings;
}
