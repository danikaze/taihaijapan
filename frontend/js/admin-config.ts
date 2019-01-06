/*
 * Entry point of the Admin Options page
 */
const GROUP_CLOSED_CLASS = 'closed';

interface AppWindow extends Window {
  run(): void;
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
 * Add functionality to the update button, to submit the options to update
 */
function enableUpdateButton(): void {
  const form = document.forms[0];
  const button = document.getElementById('update-button');

  button.addEventListener('click', () => {
    form.submit();
  });
}

(window as AppWindow).run = (): void => {
  enableTogglers();
  enableUpdateButton();
};
