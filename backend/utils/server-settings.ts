import * as path from 'path';
import { existsSync } from 'fs';
import { PATH_SETTINGS } from '../../constants/paths';
import { parse as parseCommand } from './command';
import { readJsonSync } from './read-json-sync';
// import { ctlEmitter } from '../ctl/ctl-emitter';
import { log, setLogDate } from './log';
import { Settings, ServerSettings } from '../settings/index';

/*
 * Settings are initialized to this values, from less to higher priority:
 * - settings.default.json
 * - file specified in the 1st argument (if any)
 * - commands options (if any)
 */
export const settings = {} as Settings;

init();

/**
 * Given a file name tries to resolve its path.
 * It will try both as it is, or with `.json` extension (in that order), in the following locations
 * 1. As given
 * 2. As a relative path to `cwd`
 * 3. As a file in the settings folder (provided by the app)
 *
 * @return resolved path
 */
function locateSettingsFile(file: string): string {
  const paths = [
    file,
    path.join(process.cwd(), file),
    path.join(PATH_SETTINGS, file),
  ];

  for (const p of paths) {
    const res = (existsSync(p) && p) || (existsSync(`${p}.json`) && `${p}.json`);

    if (res) {
      return res;
    }
  }
}

/**
 * Initialize the settings object
 */
function init(): void {
  reset();

  const args = parseCommand();
  const settingsFile = args._[0] || process.env.SETTINGS_FILE;
  let realSettingsFile;

  if (settingsFile) {
    realSettingsFile = setFile(settingsFile);
  }

  // setCommandOptions(args);

  log.level = settings.log.logLevel;
  setLogDate(settings.log.logDate);

  if (realSettingsFile) {
    log.verbose('ServerSettings', `Loaded settings file: ${realSettingsFile}`);
  }

  // ctlEmitter.on('options', set);
}

/**
 * Fix the options of type "path" (specified in `settingsPath`) so the paths can be declared as relative
 * paths from the folder where the settings json file is stored, or from `process.cwd()` in case of
 * options given in the arguments
 *
 * @param values     map of values to fix
 * @param relativeTo path to append to each path option
 */
function fixPaths(values: ServerSettings, relativeTo: string): void {
  const settingsPath = {
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
 * @param options new options to set
 */
export function set(options: ServerSettings): void {
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
 * @param filePath path of the json file with the options
 * @return resolved and set file path
 */
export function setFile(filePath: string): string {
  const realFilePath = locateSettingsFile(filePath);

  if (!realFilePath) {
    log.warn('ServerSettings', `Couldn't find settings file in ${realFilePath}`);
    return;
  }

  const options = readJsonSync<ServerSettings>(realFilePath);
  fixPaths(options, path.dirname(realFilePath));
  set(options);

  return realFilePath;
}

/**
 * Extend the current settings with the ones specified by command line arguments
 *
 * @param commandOptions options in an object as returned by `yargs.parse()`
 * @param relativeTo     base path for the options of type "path"
 */
// function setCommandOptions(commandOptions: {}, relativeTo?: string): void {
//   const options = {} as ServerSettings;
//   const definitions = commandOptions;

//   Object.keys(definitions).forEach((key) => {
//     const value = commandOptions[key];
//     if (value === undefined) {
//       return;
//     }

//     const group = definitions[key].group.toLowerCase().replace(/:/g, '');
//     if (!options[group]) {
//       options[group] = {};
//     }
//     options[group][key] = value;
//   });

//   fixPaths(options, relativeTo || process.cwd());
//   set(options);
// }
