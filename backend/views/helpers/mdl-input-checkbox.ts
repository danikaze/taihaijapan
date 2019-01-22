interface HelperParams {
  hash: {
    id?: string;
    name?: string;
    checked?: boolean;
    label?: string;
  };
}

function mdlInputCheckbox({ hash }: HelperParams): string {
  return `<label class="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect" for="${hash.id}">
  <input type="checkbox"
         class="mdl-checkbox__input"
         value="true"
         ${hash.id && `id="${hash.id}"`}
         ${hash.name && `name="${hash.name}"`}
         ${hash.checked && 'checked'}>
  <span class="mdl-checkbox__label">${hash.label}</span>
</label>`;
}

export const helper = {
  fn: mdlInputCheckbox,
  async: false,
};
