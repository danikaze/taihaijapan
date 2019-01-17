import { Request, Response, NextFunction } from 'express';
import { ServerSettings } from '../settings/index';
import { Config } from '../../interfaces/model';
import { I18n } from '../utils/i18n';

export interface EndPoint {
  method: 'get' | 'post' | 'put' | 'delete';
  path: string;
  callback: (request: Request, response: Response, next?: NextFunction) => void;
  middleware?: (request: Request, response: Response, next?: NextFunction) => void;
}

export type EndPointsGetter = (i18n: I18n, serverSettings: ServerSettings, config: Config) => EndPoint[];
