/**
 * @param   {Object[]} imgs    List of images as { w, h, src }
 * @param   {string[]} [sizes] List of CSS media sizes to use with srcset
 * @returns {String}           <img> srcset tag as `srcset="url1 w h, ..., urln w h"`
 */
export function getSrcsetTag(imgs, sizes) {
  if (imgs.length < 2) {
    return '';
  }

  const srcset = [];

  imgs.forEach((img) => {
    let code = img.src;

    if (img.width) {
      code += ` ${img.width}w`;
    }
    if (img.height) {
      code += ` ${img.height}h`;
    }

    srcset.push(code);
  });

  let html = `srcset="${srcset.join(', ')}"`;

  if (sizes) {
    html += ` sizes="${sizes.join(', ')}"`;
  }

  return html;
}
