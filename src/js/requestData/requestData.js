import mockupData from './mockupData';

function resolveMockupData(url, options) {
  const data = mockupData[url];
  return data;
}

/**
 * Request a URL via GET and return the content as plain text
 *
 * @param   {String}  url                url to open
 * @param   {Object}  [options]
 * @param   {*}       [options.mockData]
 * @param   {Number}  [options.timeout]  Timeout in ms.
 * @returns {Promise}                    Promise resolved to `[xhr.responseText, xhr]`
 */
function requestData(url, options) {
  options = options || {};

  return new Promise((resolve, reject) => {
    const mock = options.mockData || resolveMockupData(url, options);
    if (mock) {
      resolve([mock]);
      return;
    }

    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);

    if (options.timeout) {
      xhr.timeout = options.timeout;
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
