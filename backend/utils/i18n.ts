import * as Polyglot from 'node-polyglot';
import { isArray } from 'vanilla-type-check/isArray';
import { isString } from 'vanilla-type-check/isString';
import { isObject } from 'vanilla-type-check/isObject';
import { readJsonSync } from './read-json-sync';
import { getAllFiles } from './get-all-files';
import { log } from './log';

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

interface Translations {
  [lang: string]: {
    [namespace: string]: Polyglot;
  };
}

/**
 * Localization manager
 */
export class I18n {
  /** List of loaded translations */
  private readonly translations: Translations = {};
  /** default language to fallback if the requested doesn't exist */
  private readonly defaultLang: string;
  /** cached */
  private readonly cachedTranslations: { [key: string]: Polyglot[] } = {};

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
  public getNamespace(lang: string, namespaces: string | string[]): (key: string, n?: number) => string {
    const cacheKey = `${lang}:${isString(namespaces) ? namespaces : (namespaces as string[]).join(',')}`;
    let translations = this.cachedTranslations[cacheKey];

    {
      if (!translations) {
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
      }
    }

    return (key, n?) => {
      for (const p of translations) {
        const text = p.t(key, n);
        if (text !== undefined) {
          return text;
        }
      }

      log.warn('i18n', `"${lang}" translation not found"`);
      return key;
    };
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
    }

    let polyglot = locale[id];
    if (!polyglot) {
      polyglot = new Polyglot({ locale: lang });
      locale[id] = polyglot;
    }
    polyglot.extend(phrases);
  }
}
