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

  const deleteClasses = this.deleted ? ' mdl-button--fab mdl-button--colored' : '';
  const details = '<div class="edit">'
    + `<img src=${this.imgs[0].src}>`
    + '<div class="properties">'
      + `<div class="property id"><span>ID:</span> ${this.id}</div>`
      + `<div class="property added"><span>Added:</span> ${this.added}</div>`
      + `<div class="property updated"><span>Updated:</span> ${this.updated}</div>`
      + '<div class="property permalink">'
        + '<span>Permalink:</span> '
        + `<a href="/photo/${this.slug}/">/photo/${this.slug}/</a>`
      + '</div>'
      + '<div class="property title"><label><span>Title:</span>'
      + `<input name="title" value="${this.title}"></label></div>`
      + '<div class="property slug"><label><span>Slug:</span>'
        + `<input name="slug" value="${this.slug}"></label></div>`
      + '<div class="property tags"><label><span>Tags:</span>'
        + `<input name="tags" value="${this.tags.join(', ')}"></label></div>`
      + '<div class="property keywords"><label><span>Keywords:</span>'
        + `<input name="keywords" value="${this.keywords}"></label></div>`
    + '</div>'
    + `<button class="delete-button mdl-button mdl-js-button mdl-button--icon${deleteClasses}">`
      + '<i class="material-icons">delete</i>'
    + '</button>'
    + '<button class="close-button mdl-button ml-js-button mdl-button--icon">'
      + '<i class="material-icons">close</i>'
    + '</button>'
    + '<button class="update-icon mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-button--colored">'
      + '<i class="material-icons">cloud_upload</i>'
    + '</button>'
  + '</div>';

  const liClasses = `mdl-cell--3-col mdl-cell--4-col-tablet mdl-cell--6-col-phone${this.deleted ? ' removed' : ''}`;
  return `<li data-photo-id="${this.id}" class="${liClasses}">${preview}${details}</li>`;
}

module.exports = {
  fn: adminPhoto,
  async: false,
};
