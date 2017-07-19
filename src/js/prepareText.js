/**
 * Localize and show the texts
 */
function prepareText() {
  const userLanguage = (navigator.userLanguage || navigator.language || navigator.browserLanguage || '').toLowerCase();
  let shownTextId;

  if (userLanguage.indexOf('es') === 0) {
    shownTextId = 'text-es';
  } else if (userLanguage === 'ja') {
    shownTextId = 'text-ja';
  } else {
    shownTextId = 'text-en';
  }

  window.onload = () => {
    document.getElementById(shownTextId).className += ' showText';
  };
}

export default prepareText;
