export interface RequestDataOptions<T> {
  /** Query data to send */
  data?: {};
  /** Method of the request */
  method: 'get' | 'post' | 'put' | 'delete';
  /** If specified this will be the value resolved, instead of doing the request  */
  mockData?: T;
  /** Timeout in ms. */
  timeout?: number;
  /** If `false`, `_t` won't be appended */
  cache?: boolean;
}

function urlAddParams(url, data) {
  let joiner = url.indexOf('?') === -1 ? '?' : '&';

  Object.keys(data).forEach((key) => {
    let value = data[key];
    if (typeof value === 'object') {
      value = JSON.stringify(value);
    }
    url = `${url}${joiner}${key}=${encodeURIComponent(value)}`;
    joiner = '&';
  });

  return url;
}

/**
 * Request a URL via GET and return the content as plain text
 *
 * @returns Promise resolved to the response JSON
 */
function requestData<T = {}>(url: string, options?: RequestDataOptions<T>): Promise<T> {
  const opt = {
    method: 'get',
    cache: true,
    ...options,
  };

  return new Promise((resolve, reject) => {
    if (opt.mockData) {
      resolve(opt.mockData);
      return;
    }

    if (typeof opt.data === 'object') {
      if (opt.method === 'post') {
        //
      } else {
        url = urlAddParams(url, opt.data);
      }
    }

    if (!opt.cache) {
      url = urlAddParams(url, { _t: new Date().getTime() });
    }

    const xhr = new XMLHttpRequest();
    xhr.open(opt.method, url, true);

    if (opt.timeout) {
      xhr.timeout = opt.timeout;
    }

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status >= 200 && xhr.status < 400) {
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

export default requestData;
