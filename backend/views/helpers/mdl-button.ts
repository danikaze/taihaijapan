interface HelperParams {
  hash: {
    style: 'raised' | 'action' | 'accent'
    id: string;
    label?: string;
  };
}

const styleClasses = {
  raised: 'mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect',
  action: 'mdl-button',
  accent: 'mdl-button mdl-button--accent mdl-button-colored',
};

function mdlButton({ hash }: HelperParams): string {
  return `<button ${hash.id && `id="${hash.id}"`} class="${styleClasses[hash.style]}">
  ${hash.label}
</button>`;
}

export const helper = {
  fn: mdlButton,
  async: false,
};
