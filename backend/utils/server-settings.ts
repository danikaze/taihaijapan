import * as path from 'path';
import { existsSync } from 'fs';
import { parse as parseCommand } from './command';
import { readJsonSync } from './read-json-sync';
import { ctlEmitter } from '../ctl/ctl-emitter';
import { log, setLogDate } from './log';
import { Settings } from '../settings/index';

/*
 * Settings are initialized to this values, from less to higher priority:
 * - settings.default.json
 * - file specified in the 1st argument (if any)
 * - commands options (if any)
 */
export const settings: Settings = {} as Settings;

init();

function locateSettingsFile(file) {
  let res = file;

  // test for absolute path
  if (!existsSync(res)) {
    res = path.join(process.cwd(), file);

    // test for relative path
    if (!existsSync(res)) {
      res = path.join(__dirname, '../settings', file);

      // test for file located in setings folder
      if (!existsSync(res)) {
        return null;
      }
    }
  }

  return res;
}

/**
 * Initialize the settings object
 */
function init() {
  reset();

  const args = parseCommand();
  const settingsFile = args._[0] || process.env.SETTINGS_FILE;

  if (settingsFile) {
    setFile(settingsFile);
  }

  // setCommandOptions(args);

  log.level = settings.log.logLevel;
  setLogDate(settings.log.logDate);

  if (settingsFile) {
    log.verbose('ServerSettings', `Loaded settings file: ${settingsFile}.`);
  }

  // ctlEmitter.on('options', set);
}

/**
 * Fix the options of type "path" (specified in `settingsPath`) so the paths can be declared as relative
 * paths from the folder where the settings json file is stored, or from `process.cwd()` in case of
 * options given in the arguments
 *
 * @param {object} values     map of values to fix
 * @param {string} relativeTo path to append to each path option
 */
function fixPaths(values, relativeTo) {
  const settingsPath = {
    server: [
      'viewsPath',
      'helpersPath',
      'partialsPath',
      'publicPath',
      'imagesOriginalPath',
      'imagesTemporalPath',
      'imagesThumbPath',
    ],
    db: [
      'path',
    ],
  };

  Object.keys(settingsPath).forEach((sectionName) => {
    const section = values[sectionName];
    if (!section) {
      return;
    }
    settingsPath[sectionName].forEach((key) => {
      const value = section[key];
      if (!value) {
        return;
      }
      section[key] = path.resolve(relativeTo, value);
    });
  });
}

/**
 * Set all options to the default ones
 */
export function reset() {
  const settingsFile = locateSettingsFile('default.json');

  if (!settingsFile) {
    log.error('ServerSettings', 'Can\'t find default settings. Exiting...');
    process.exit(-1);
  }

  Object.keys(settings).forEach((key) => {
    delete settings[key];
  });

  setFile(settingsFile);
}

/**
 * Extend the current settings with the new ones.
 *
 * @param {object} options new options to set (an object as `{ section: { key: value } }`)
 */
export function set(options) {
  Object.keys(options).forEach((section) => {
    if (!settings[section]) {
      settings[section] = {};
    }
    Object.assign(settings[section], options[section]);
  });
}

/**
 * Extend the current settings with the ones specified in a json file.
 *
 * @param {string} filePath path of the json file with the options
 */
export function setFile(filePath) {
  filePath = locateSettingsFile(filePath);

  if (!filePath) {
    log.warn('ServerSettings', `Couldn't find settings file in ${filePath}`);
    return;
  }

  const options = readJsonSync(filePath);
  fixPaths(options, path.dirname(filePath));
  set(options);
}

/**
 * Extend the current settings with the ones specified by command line arguments
 *
 * @param {object} commandOptions options in an object as returned by `yargs.parse()`
 * @param {string} relativeTo     base path for the options of type "path"
 */
function setCommandOptions(commandOptions, relativeTo?) {
  const options = {};
  const definitions = commandOptions;

  Object.keys(definitions).forEach((key) => {
    const value = commandOptions[key];
    if (value === undefined) {
      return;
    }

    const group = definitions[key].group.toLowerCase().replace(/:/g, '');
    if (!options[group]) {
      options[group] = {};
    }
    options[group][key] = value;
  });

  fixPaths(options, relativeTo || process.cwd());
  set(options);
}
