/**
 * @param   {Object[]} imgs List of images as { w, h, src }
 * @returns {String}        <img> srcset tag as `srcset="url1 w, ..., urln w"`
 */
function getSrcSetTag(imgs, sizes) {
  if (imgs.length < 2) {
    return '';
  }

  const srcset = [];

  imgs.forEach((img) => {
    let code = img.src;

    if (img.w) {
      code += ` ${img.w}w`;
    }

    srcset.push(code);
  });

  let html = `srcset="${srcset.join(', ')}"`;

  if (sizes) {
    html += ` sizes="${sizes.join(', ')}"`;
  }

  return html;
}

module.exports = getSrcSetTag;
