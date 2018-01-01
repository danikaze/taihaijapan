function adminPhoto() {
  const preview = '<div class="preview mdl-card mdl-shadow--2dp">'
    + `<div class="mdl-card__title mdl-card--expand"><img src=${this.imgs[0].src}></div>`
    + '<div class="mdl-card__actions">'
      + '<button class="permalink mdl-button mdl-js-button mdl-button--icon">'
        + `<a href="/photo/${this.slug}/"><i class="material-icons">link</i></a>`
      + '</button>'
      + `<span class="slug">${this.slug}</span>`
    + '</div>'
    + '<button class="update-icon mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-button--colored">'
      + '<i class="material-icons">cloud_upload</i>'
    + '</button>'
  + '</div>';

  const liClasses = `mdl-cell--3-col mdl-cell--4-col-tablet mdl-cell--6-col-phone${this.deleted ? ' removed' : ''}`;
  return `<li data-photo-id="${this.id}" class="${liClasses}">${preview}</li>`;
}

module.exports = {
  fn: adminPhoto,
  async: false,
};
