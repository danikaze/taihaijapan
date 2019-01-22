interface HelperParams {
  hash: {
    id: string;
    label?: string;
  };
}

function mdlButton({ hash }: HelperParams): string {
  return `<button ${hash.id && `id="${hash.id}"`} class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect">
  ${hash.label}
</button>`;
}

export const helper = {
  fn: mdlButton,
  async: false,
};
