interface HelperParams {
  hash: {
    id: string;
    name: string;
    value: string;
    options: string[];
    label?: string;
    allowEmpty?: boolean;
  };
}

function mdlInputSimpleSelect({ hash }: HelperParams): string {
  return `<div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label getmdl-select">
  <input type="text"
         value="${ hash.value !== undefined ? hash.value : ''}"
         class="mdl-textfield__input"
         id="${hash.id}"
         ${hash.allowEmpty ? '' : `pattern=(${hash.options.join(')|(')})`}
         readonly>
  <input type="hidden"
         value="${ hash.value !== undefined ? hash.value : ''}"
         name="${hash.name}">
  <i class="mdl-icon-toggle__label material-icons">keyboard_arrow_down</i>
  ${hash.label !== undefined ? `<label for="${hash.id}" class="mdl-textfield__label">${hash.label}</label>` : ''}
  <ul for="${hash.id}" class="mdl-menu mdl-menu--bottom-left mdl-js-menu">
    ${hash.options.map((option) => `<li class="mdl-menu__item" data-val="${option}"
                                      ${option === hash.value ? 'data-selected="true"' : ''}>${option}</li>`).join('')}
  </ul>
</div>`;
}

export const helper = {
  fn: mdlInputSimpleSelect,
  async: false,
};
