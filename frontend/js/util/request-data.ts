export interface RequestDataOptions<T> {
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
}

const STATE_READY = 4;
const HTTP_STATE_OK = 200;
const HTTP_STATE_ERROR = 400;

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
export function requestData<T = {}>(url: string, options?: RequestDataOptions<T>): Promise<T> {
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
      if (opt.method === 'post') {
        //
      } else {
        requestUrl = urlAddParams(requestUrl, opt.data);
      }
    }

    if (!opt.cache) {
      requestUrl = urlAddParams(requestUrl, { _t: new Date().getTime() });
    }

    const xhr = new XMLHttpRequest();
    xhr.open(opt.method, requestUrl, true);

    if (opt.timeout) {
      xhr.timeout = opt.timeout;
    }

    xhr.onreadystatechange = () => {
      if (xhr.readyState !== STATE_READY) {
        return;
      }

      if (xhr.status >= HTTP_STATE_OK && xhr.status < HTTP_STATE_ERROR) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch (e) {
          resolve();
        }
      } else {
        try {
          reject({
            xhr,
            error: JSON.parse(xhr.responseText),
          });
        } catch (e) {
          reject({
            xhr,
          });
        }
      }
    };

    try {
      xhr.send();
    } catch (error) {
      reject({
        xhr,
        error,
      });
    }
  });
}
