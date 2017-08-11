import requestData from './requestData';
import isString from '../isString';

/**
 * Opens a URL and load a JSON object
 *
 * @param   {String}  url URL to open
 * @returns {Promise}     Promise resolved to the JSON object
 */
function requestJson(url, options) {
  return new Promise((resolve, reject) => {
    function resolveJson([data, xhr]) {
      if (!isString(data)) {
        data = JSON.stringify(data);
      }
      try {
        const json = JSON.parse(data);
        resolve(json, xhr);
      } catch (error) {
        reject(xhr, error);
      }
    }

    requestData(url, options).then(resolveJson, reject);
  });
}

export default requestJson;
