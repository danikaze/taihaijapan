import { Application, Request, Response, NextFunction } from 'express';
import { ServerSettings } from '../../backend/settings/index';
import { Config } from '../../interfaces/model';

export interface EndPoint {
  method: 'get' | 'post' | 'put' | 'delete';
  path: string;
  callback: (request: Request, response: Response, next?: NextFunction) => void;
  middleware?: (request: Request, response: Response, next?: NextFunction) => void;
}

export type EndPointsGetter = (app: Application, serverSettings: ServerSettings, config: Config) => EndPoint[];
