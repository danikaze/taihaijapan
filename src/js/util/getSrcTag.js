/**
 * @param   {Object[]} imgs List of images as { w, h, src }
 * @returns {String}        <img> srcset tag as `srcset="url1 w h, ..., urln w h"`
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
    if (img.h) {
      code += ` ${img.h}h`;
    }

    srcset.push(code);
  });

  let html = `srcset="${srcset.join(', ')}"`;

  if (sizes) {
    html += ` sizes="${sizes.join(', ')}"`;
  }

  return html;
}

export default getSrcSetTag;
