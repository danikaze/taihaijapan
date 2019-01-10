import { requestData } from './util/request-data';
import { showSnackbar } from './util/show-snackbar';

/*
 * Entry point of the Admin Options page
 */
const GROUP_CLOSED_CLASS = 'closed';
const SELECTOR_ID = '#config-admin input[name="admin.id"]';
const SELECTOR_PWD = '#config-admin input[name="admin.password"]';
const SELECTOR_PWD2 = '#config-admin input[name="admin.passwordConfirmation"]';

interface AppWindow extends Window {
  run(url: string): void;
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
function updateOptions(url: string, button: HTMLButtonElement, options: {}): void {
  function updateSuccess() {
    button.disabled = false;
    showSnackbar('Options updated');
  }

  function updateError() {
    button.disabled = false;
    showSnackbar('An error happened while trying to update the options.', 'Retry')
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
      admin: {
        id: (document.querySelector(SELECTOR_ID) as HTMLInputElement).value,
        password: (document.querySelector(SELECTOR_PWD) as HTMLInputElement).value,
        passwordConfirmation: (document.querySelector(SELECTOR_PWD2) as HTMLInputElement).value,
      },
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

(window as AppWindow).run = (url) => {
  enableTogglers();
  enableUpdateButton(url);
};
