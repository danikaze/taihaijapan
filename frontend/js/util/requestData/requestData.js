import mockupData from './mockupData';

function resolveMockupData(url, options) {
  const data = mockupData[url];
  return data;
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
 * @param   {String}  url                    url to open
 * @param   {Object}  [options]
 * @param   {Object}  [options.data]         Data to send
 * @param   {string}  [options.method='GET'] Method of the request (`GET`|`POST`|`PUT`|`DELETE`)
 * @param   {*}       [options.mockData]     If specified this will be the value resolved, instead of doing the request
 * @param   {Number}  [options.timeout]      Timeout in ms.
 * @param   {Boolean} [options.cache]        If `true`, `_t` won't be appended
 * @returns {Promise}                        Promise resolved to `[xhr.responseText, xhr]`
 */
function requestData(url, options) {
  const opt = Object.assign({
    method: 'GET',
  }, options);
  opt.method = opt.method.toUpperCase();

  return new Promise((resolve, reject) => {
    const mock = opt.mockData || resolveMockupData(url, opt);
    if (mock) {
      resolve([mock]);
      return;
    }

    if (typeof opt.data === 'object') {
      if (opt.method === 'POST') {
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
          resolve([xhr.responseText, xhr]);
        } else {
          reject(xhr);
        }
      }
    };

    try {
      xhr.send();
    } catch (e) {
      reject(xhr, e);
    }
  });
}

export default requestData;
