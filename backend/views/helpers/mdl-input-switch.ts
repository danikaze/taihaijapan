interface HelperParams {
  hash: {
    id?: string;
    name?: string;
    checked?: boolean;
    label?: string;
  };
}

function mdlInputSwitch({ hash }: HelperParams): string {
  return `<label class="hide-button mdl-switch mdl-js-switch mdl-js-ripple-effect">
  <input type="checkbox"
         class="mdl-switch__input"
         value="true"
         ${hash.id && `id="${hash.id}"`}
         ${hash.name && `name="${hash.name}"`}
         ${hash.checked ? 'checked' : ''}>
  <span class="switch-text">${hash.label}</span>
</label>`;
}

export const helper = {
  fn: mdlInputSwitch,
  async: false,
};
