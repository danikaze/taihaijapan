import { requestData } from './util/request-data';
import { showSnackbar } from './util/show-snackbar';
import { Dict } from '../../interfaces/frontend';

interface AppWindow extends Window {
  run(url: string, i18n: Dict<string>): void;
}

interface UserOptions {
  id: string;
  username: string;
  lang: string;
  password: string;
  passwordConfirmation: string;
}

/*
 * Entry point of the Admin Options page
 */
const GROUP_CLOSED_CLASS = 'closed';
const SELECTOR_USERNAME = '#config-admin input[name="admin.username"]';
const SELECTOR_ID = '#config-admin input[name="admin.id"]';
const SELECTOR_LANG = '#config-admin input[name="admin.lang"]';
const SELECTOR_PWD = '#config-admin input[name="admin.password"]';
const SELECTOR_PWD2 = '#config-admin input[name="admin.passwordConfirmation"]';

let originalAdminOptions: UserOptions;
/** Localized messages */
let i18n: Dict<string>;

/**
 * @return `true` if values from `b` are not the same as values from `b`
 */
function equalUsers(a: UserOptions, b: UserOptions): boolean {
  return a.id === b.id
      && a.username === b.username
      && a.lang === b.lang
      && a.password === b.password
      && a.passwordConfirmation === b.passwordConfirmation;
}

/**
 * Retrieve the admin values from the HTML and return them as an object
 */
function getAdminObject(): UserOptions {
  return {
    id: (document.querySelector(SELECTOR_ID) as HTMLInputElement).value,
    username: (document.querySelector(SELECTOR_USERNAME) as HTMLInputElement).value,
    lang: (document.querySelector(SELECTOR_LANG) as HTMLInputElement).value,
    password: (document.querySelector(SELECTOR_PWD) as HTMLInputElement).value,
    passwordConfirmation: (document.querySelector(SELECTOR_PWD2) as HTMLInputElement).value,
  };
}

/**
 * Add functionality to the h4 title elements to toggle groups (visible/hidden)
 */
function enableTogglers(): void {
  document.querySelectorAll('h4[data-toggle]').forEach((button: HTMLElement) => {
    const contents = document.getElementById(button.dataset.toggle);
    button.addEventListener('click', () => {
      if (contents.style.display === 'none') {
        contents.style.display = 'block';
        button.classList.add(GROUP_CLOSED_CLASS);
      } else {
        contents.style.display = 'none';
        button.classList.remove(GROUP_CLOSED_CLASS);
      }
    });
  });
}

/**
 * Send the options to update
 */
function updateOptions(url: string, button: HTMLButtonElement, options: { admin: UserOptions }): void {
  function updateSuccess(data) {
    button.disabled = false;
    if (data.errors.length !== 0) {
      showSnackbar(i18n.passwordsDontMatch);
    } else if (equalUsers(originalAdminOptions, options.admin)) {
      showSnackbar(i18n.optionsUpdated);
    } else if (location.search.indexOf('updated') !== -1){
      location.reload();
    } else {
      location.href = `${location.origin}${location.pathname}?updated`;
    }
  }

  function updateError() {
    button.disabled = false;
    showSnackbar(i18n.optionsUpdateError, i18n.actionRetry)
      .then(tryUpdate);
  }

  function tryUpdate() {
    button.disabled = true;
    requestData(url, { body: options, method: 'put', cache: false }).then(updateSuccess, updateError);
  }

  tryUpdate();
}

/**
 * Add functionality to the update button, to submit the options to update
 */
function enableUpdateButton(url: string): void {
  const button = document.getElementById('update-button') as HTMLButtonElement;

  button.addEventListener('click', () => {
    const options = {
      // admin config
      admin: getAdminObject(),
      sizes: [],
    };

    // get the "normal" options
    [
      'config-site',
      'config-page-admin',
      'config-page-index',
      'config-gallery-options',
      'config-images-options',
    ].forEach((sectionId) => {
      Array.from(document.getElementById(sectionId).querySelectorAll('input')).forEach((elem) => {
        options[elem.name] = elem.value;
      });
    });

    // thumb sizes
    Array.from(document.getElementsByClassName('thumb-size')).forEach((elem) => {
      options.sizes.push({
        id: (elem.querySelector('[name=id]') as HTMLInputElement).value,
        label: (elem.querySelector('[name=label]') as HTMLInputElement).value,
        width: (elem.querySelector('[name=width]') as HTMLInputElement).value,
        height: (elem.querySelector('[name=height]') as HTMLInputElement).value,
        quality: (elem.querySelector('[name=quality]') as HTMLInputElement).value,
      });
    });

    updateOptions(url, button, options);
  });
}

(window as AppWindow).run = (url, translations) => {
  originalAdminOptions = getAdminObject();
  i18n = translations;

  enableTogglers();
  enableUpdateButton(url);
};
