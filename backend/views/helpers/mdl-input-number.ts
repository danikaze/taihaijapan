interface HelperParams {
  hash: {
    id: string;
    name: string;
    value: string;
    label?: string;
    min?: number;
    max?: number;
    step?: number;
  };
}

function mdlInputNumber({ hash }: HelperParams): string {
  return `<div class="mdl-textfield mdl-js-textfield ${hash.label ? 'mdl-textfield--floating-label' : ''}">
  <input class="mdl-textfield__input"
         type="number"
         id="${hash.id}"
         name="${hash.name}"
         value="${hash.value !== undefined ? hash.value : ''}"
         ${hash.min !== undefined ? `min="${hash.min}"` : ''}
         ${hash.max !== undefined ? `max="${hash.max}"` : ''}
         ${hash.step !== undefined ? `step="${hash.step}"` : ''}>
  ${hash.label ? `<label class="mdl-textfield__label" for="${hash.id}">${hash.label}</label>` : ''}
</div>`;
}

export const helper = {
  fn: mdlInputNumber,
  async: false,
};
