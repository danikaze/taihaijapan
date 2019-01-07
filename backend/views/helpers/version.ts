import * as packageJson from '../../../package.json';

const v = packageJson.version;
function version() {
  return v;
}

export const helper = {
  fn: version,
  async: false,
};
