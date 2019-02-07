interface HelperParams {
  hash: {
    id: string;
    name: string;
    value?: string;
    label?: string;
    pattern?: string;
    password?: boolean;
  };
}

function mdlInputText({ hash }: HelperParams): string {
  return `<div class="mdl-textfield mdl-js-textfield ${hash.label ? 'mdl-textfield--floating-label' : ''}">
  <input class="mdl-textfield__input"
         type="${hash.password ? 'password' : 'text'}"
         id="${hash.id}"
         name="${hash.name}"
         value="${hash.value !== undefined ? hash.value : ''}"
         ${hash.pattern !== undefined ? `pattern="${hash.pattern}"` : ''}>
  ${hash.label ? `<label class="mdl-textfield__label" for="${hash.id}">${hash.label}</label>` : ''}
</div>`;
}

export const helper = {
  fn: mdlInputText,
  async: false,
};
