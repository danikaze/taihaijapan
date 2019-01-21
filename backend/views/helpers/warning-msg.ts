function warningMsg(text) {
  return '<div class="warning-msg">'
      + '<div class="warning-msg-content">'
        + text
      + '</div>'
    + '</div>';
}

export const helper = {
  fn: warningMsg,
  async: false,
};
