import { log } from '../../utils/log';
import { model } from '../index';
import { Config } from '../interfaces';
import { schema } from '../schemas/config';

/**
 * Get a string to store the value of a setting based on the schema
 */
function serialize(name: string, value: any): string {
  return schema[name] === 'json' ? JSON.stringify(value) : String(value);
}

/**
 * Update the provided configuration in the database
 * TODO: Trigger an event to notify multiple server instances to invalidate the config cache
 */
export function updateConfig(config: Config): Promise<void> {
  return model.ready.then(({ stmt }) => new Promise<void>((resolve, reject) => {
    const keys = Object.keys(config);
    let left = keys.length;

    function checkDone(error) {
      if (error) {
        log.error('sqlite: updateConfig', error.message);
        reject(error);
        return;
      }

      left--;
      if (left === 0) {
        resolve();
      }
    }

    keys.forEach((name) => {
      const value = serialize(name, config[name]);
      stmt.updateSetting.run([value, name], checkDone);
    });
  }));
}
