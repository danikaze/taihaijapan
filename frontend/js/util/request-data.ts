import { HTTP_CODE_200_OK, HTTP_CODE_400_BAD_REQUEST } from '../../../constants/http';

export interface RequestDataOptions<B, T> {
  /** Query data to send */
  data?: {};
  /** Method of the request */
  method: 'get' | 'post' | 'put' | 'delete';
  /** If specified this will be the value resolved, instead of doing the request  */
  mockData?: T;
  /** Timeout in ms. */
  timeout?: number;
  /** If `false`, `_t` won't be appended (default `true`) */
  cache?: boolean;
  /** Body to send */
  body?: B;
}

const STATE_READY = 4;

/**
 * Add the specified data to a url
 */
function urlAddParams(url: string, data): string {
  let joiner = url.indexOf('?') === -1 ? '?' : '&';
  let res = url;

  Object.keys(data).forEach((key) => {
    let value = data[key];
    if (typeof value === 'object') {
      value = JSON.stringify(value);
    }
    res = `${res}${joiner}${key}=${encodeURIComponent(value)}`;
    joiner = '&';
  });

  return res;
}

/**
 * Request a URL via GET and return the content as plain text
 *
 * @returns Promise resolved to the response JSON
 */
export function requestData<B = {}, T = {}>(url: string, options?: RequestDataOptions<B, T>): Promise<T> {
  const opt = {
    method: 'get',
    cache: true,
    ...options,
  };

  return new Promise<T>((resolve, reject) => {
    if (opt.mockData) {
      resolve(opt.mockData);
      return;
    }

    let requestUrl = url;
    if (typeof opt.data === 'object') {
      requestUrl = urlAddParams(requestUrl, opt.data);
    }

    if (!opt.cache) {
      requestUrl = urlAddParams(requestUrl, { _t: new Date().getTime() });
    }

    const xhr = new XMLHttpRequest();
    xhr.open(opt.method, requestUrl, true);

    const body = typeof opt.body === 'object' ? JSON.stringify(opt.body) : null;
    if (body) {
      xhr.setRequestHeader('Content-Type', 'application/json');
    }

    if (opt.timeout) {
      xhr.timeout = opt.timeout;
    }

    xhr.onreadystatechange = () => {
      if (xhr.readyState !== STATE_READY) {
        return;
      }

      if (xhr.status >= HTTP_CODE_200_OK && xhr.status < HTTP_CODE_400_BAD_REQUEST) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch (e) {
          resolve();
        }
      } else {
        try {
          reject(JSON.parse(xhr.responseText));
        } catch (e) {
          reject();
        }
      }
    };

    try {
      xhr.send(body);
    } catch (error) {
      reject({
        xhr,
        error,
      });
    }
  });
}
