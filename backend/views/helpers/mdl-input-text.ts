interface HelperParams {
  hash: {
    id: string;
    name: string;
    value?: string;
    label?: string;
    pattern?: string;
    password?: boolean;
    errorText?: string;
    maxLength?: number;
  };
}

function mdlInputText({ hash }: HelperParams): string {
  return `<div class="mdl-textfield mdl-js-textfield ${hash.label ? 'mdl-textfield--floating-label' : ''}">
  <input class="mdl-textfield__input"
         type="${hash.password ? 'password' : 'text'}"
         id="${hash.id}"
         name="${hash.name}"
         ${hash.value !== undefined ? `value="${hash.value}"` : ''}
         ${hash.pattern !== undefined ? `pattern="${hash.pattern}"` : ''}
         ${hash.maxLength ? `maxlength="${hash.maxLength}"` : ''}>
  ${hash.label ? `<label class="mdl-textfield__label" for="${hash.id}">${hash.label}</label>` : ''}
  ${hash.errorText ? `<span class="mdl-textfield__error">${hash.errorText}</span>` : ''}
</div>`;
}

export const helper = {
  fn: mdlInputText,
  async: false,
};
