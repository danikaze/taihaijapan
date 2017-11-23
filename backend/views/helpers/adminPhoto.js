function adminPhoto() {
  const preview = '<div class="preview">'
    + `<img src=${this.imgs[0].src}>`
    + `<div class="id">#${this.id}</div> <div class="slug">${this.slug}</div>`
  + '</div>';

  const details = '<div class="edit">'
    + `<img src=${this.imgs[0].src}>`
    + '<div class="properties">'
      + `<div class="property id"><span>ID:</span> ${this.id}</div>`
      + `<div class="property added"><span>Added:</span> ${this.added}</div>`
      + `<div class="property updated"><span>Updated:</span> ${this.updated}</div>`
      + '<div class="property title"><label><span>Title:</span>'
      + `<input name="title" value="${this.title}"></label></div>`
      + '<div class="property slug"><label><span>Slug:</span>'
        + `<input name="slug" value="${this.slug}"></label></div>`
      + '<div class="property tags"><label><span>Tags:</span>'
        + `<input name="tags" value="${this.tags.join(', ')}"></label></div>`
      + '<div class="property keywords"><label><span>Keywords:</span>'
        + `<input name="keywords" value="${this.keywords}"></label></div>`
    + '</div>'
    + '<div class="delete-button"><div>Remove photo</div></div>'
    + '<div class="restore-button"><div>Restore photo</div></div>'
    + '<div class="close-button"><div>✖</div></div>'
  + '</div>';

  const removedStatus = this.deleted ? ' class="removed"' : '';
  return `<li data-photo-id="${this.id}"${removedStatus}>${preview}${details}</li>`;
}

module.exports = {
  fn: adminPhoto,
  async: false,
};
