import * as packageJson from '../../../package.json';

const v = packageJson.version;
function version() {
  return v;
}

export default {
  fn: version,
  async: false,
};
