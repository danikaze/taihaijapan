import * as Polyglot from 'node-polyglot';
import { isArray } from 'vanilla-type-check/isArray';
import { isString } from 'vanilla-type-check/isString';
import { isObject } from 'vanilla-type-check/isObject';

import { Dict } from '../../interfaces/frontend';
import { readJsonSync } from './read-json-sync';
import { getAllFiles } from './get-all-files';
import { log } from './log';
import { addUnique } from './add-unique';
import { getPlainKeys } from './get-plain-keys';

export interface TranslationFile {
  lang: string;
  namespaces: TranslationFileNamespace[];
}

export interface TranslationFileNamespace {
  id: string;
  phrases: { [key: string]: string | TranslationDefinition };
}

export interface TranslationDefinition {
  [key: string]: string | TranslationDefinition;
}

export interface LocaleNamespace {
  t(key: string, n?: number): string;
  all(): Dict<string>;
}

interface Locale<T> {
  [lang: string]: {
    [namespace: string]: T;
  };
}

/**
 * Localization manager
 */
export class I18n {
  /** List of available keys per language and namespace */
  private readonly namespaceKeys: Locale<string[]> = {};
  /** List of loaded translations */
  private readonly translations: Locale<Polyglot> = {};
  /** default language to fallback if the requested doesn't exist */
  private readonly defaultLang: string;
  /** cached */
  private readonly cachedTranslations: { [key: string]: Polyglot[] } = {};
  /** cached keys for each namespace */
  private readonly cachedKeys: { [key: string]: string[] } = {};

  /**
   * @param defaultLanguage Default language to fallback if the requested doesn't exist
   */
  constructor(defaultLanguage: string = 'en') {
    this.defaultLang = defaultLanguage;
  }

  /**
   * Try to load all the translation files from the specified routes
   *
   * @param paths list of paths to check
   */
  public loadResources(paths: string[]): void {
    paths.forEach((path) => {
      const files = getAllFiles(path, '.json');
      files.forEach((file) => {
        const { lang, namespaces } = readJsonSync<TranslationFile>(file);

        if (!lang || !isString(lang)) {
          log.error('i18n', `Error loading ${file}: lang not defined`);
          return;
        }
        if (!namespaces || !isArray(namespaces)) {
          log.error('i18n', `Error loading ${file}: namespaces not defined`);
          return;
        }

        namespaces.forEach((namespace) => {
          if (!isString(namespace.id)) {
            log.error('i18n', `Error loading ${file}: namespace.id not defined`);
            return;
          }

          if (!isObject(namespace.phrases)) {
            log.error('i18n', `Error loading ${file}: namespace.phrases not defined`);
            return;
          }

          this.loadNamespace(lang, namespace);
        });
      });
    });
  }

  /**
   * Get an object with the combined values of the provided namespaces
   *
   * @param lang Language to provide translations
   * @param namespaces Especified namespaces
   */
  public getNamespace(lang: string, namespaces: string | string[]): LocaleNamespace {
    const translations = this.getTranslations(lang, namespaces);
    const keys = this.getKeys(lang, namespaces);

    /**
     * Given a key (and a optional quantity) return its translation
     */
    function t(key: string, n?: number): string {
      for (const p of translations) {
        const text = p.t(key, n);
        if (text !== undefined) {
          return text;
        }
      }

      log.warn('i18n', `"${lang}" translation not found"`);
      return key;
    }

    /**
     * Get all translations as { key: translation }
     */
    function all(): Dict<string> {
      const res: Dict<string> = {};

      keys.forEach((key) => {
        res[key] = t(key);
      });

      return res;
    }

    return { t, all };
  }

  /**
   * Get a list of loaded translations languages
   */
  public getAvailableLanguages(): string[] {
    return Object.keys(this.translations);
  }

  /**
   * Load one valid namespace
   */
  private loadNamespace(lang: string, namespace: TranslationFileNamespace): void {
    const { id, phrases } = namespace;

    let locale = this.translations[lang];
    if (!locale) {
      locale = {};
      this.translations[lang] = locale;
      this.namespaceKeys[lang] = {};
    }

    let polyglot = locale[id];
    if (!polyglot) {
      polyglot = new Polyglot({ locale: lang });
      locale[id] = polyglot;
      this.namespaceKeys[lang][id] = [];
    }
    polyglot.extend(phrases);
    addUnique(this.namespaceKeys[lang][id], getPlainKeys(phrases));
  }

  /**
   * Calculate the list of correct Polyglot objects to use given a language and a list of namespaces
   * The result will be cached so it's not re-calculated on every request
   */
  private getTranslations(lang: string, namespaces: string | string[]): Polyglot[] {
    const cacheKey = `${lang}:${isString(namespaces) ? namespaces : (namespaces as string[]).join(',')}`;
    let translations = this.cachedTranslations[cacheKey];

    if (translations) {
      return translations;
    }

    translations = [];
    const defaultLocale = this.translations[this.defaultLang];
    let locale = this.translations[lang];

    if (!locale) {
      locale = this.translations[this.defaultLang];
      log.warn('i18n', `"${lang}" translation not found. Falling back to default "${this.defaultLang}"`);
    }

    const ns = (isString(namespaces) ? [namespaces] : namespaces) as string[];
    ns.forEach((namespace) => {
      let t = locale[namespace];

      if (!t) {
        log.warn('i18n', `Namespace "${namespace}" not found for "${lang}" locale`);
        t = defaultLocale && defaultLocale[namespace];
      }

      if (!t) {
        return;
      }

      translations.push(t);
    });
    this.cachedTranslations[cacheKey] = translations;

    return translations;
  }

  /**
   * Calculate the list of available translation keys given a language and a list of namespaces
   * The result will be cached so it's not re-calculated on every request
   */
  private getKeys(lang: string, namespaces: string | string[]): string[] {
    const cacheKey = `${lang}:${isString(namespaces) ? namespaces : (namespaces as string[]).join(',')}`;
    let keys = this.cachedKeys[cacheKey];

    if (keys) {
      return keys;
    }

    keys = [];
    const defaultLocale = this.namespaceKeys[this.defaultLang];
    let locale = this.namespaceKeys[lang];

    if (!locale) {
      locale = this.namespaceKeys[this.defaultLang];
    }

    const ns = (isString(namespaces) ? [namespaces] : namespaces) as string[];
    ns.forEach((namespace) => {
      let nsKeys = locale[namespace];

      if (!nsKeys) {
        nsKeys = defaultLocale && defaultLocale[namespace];
      }

      if (!nsKeys) {
        return;
      }

      addUnique(keys, nsKeys);
    });

    this.cachedKeys[cacheKey] = keys;

    return keys;
  }
}
