import { ServerSettings } from "backend/settings/index";

export interface EndPoint {
  method: 'get' | 'post' | 'put' | 'delete';
  path: string;
  callback: (request, response, next?) => void;
  middleware?: (request, response, next?) => void;
}

export type EndPointsGetter = (app, serverSettings: ServerSettings, config) => EndPoint[];
