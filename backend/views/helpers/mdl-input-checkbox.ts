interface HelperParams {
  hash: {
    id: string;
    style?: 'checkbox' | 'switch';
    name?: string;
    checked?: boolean;
    label?: string;
  };
}

const labelClasses = {
  checkbox: 'mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect',
  switch: 'hide-button mdl-switch mdl-js-switch mdl-js-ripple-effect',
};
const inputClasses = {
  checkbox: 'mdl-checkbox__input',
  switch: 'mdl-switch__input',
};
const spanClasses = {
  checkbox: 'mdl-checkbox__label',
  switch: 'switch-text',
};

function mdlInputCheckbox({ hash }: HelperParams): string {
  const style = hash.style || 'checkbox';
  return `<label class="${labelClasses[style]}" for="${hash.id}">
  <input type="checkbox"
         value="true"
         class="${inputClasses[style]}"
         id="${hash.id}"
         ${hash.name && `name="${hash.name}"`}
         ${hash.checked && 'checked'}>
  <span class="${spanClasses[style]}">${hash.label}</span>
</label>`;
}

export const helper = {
  fn: mdlInputCheckbox,
  async: false,
};
