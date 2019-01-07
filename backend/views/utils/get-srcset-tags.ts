import { Image } from '../../../backend/models/interfaces';

/**
 * @param   imgs  List of images as { w, h, src }
 * @param   sizes List of CSS media sizes to use with srcset
 * @returns       <img> srcset tag as `srcset="url1 w h, ..., urln w h"`
 */
export function getSrcsetTag(imgs: Image[], sizes?: string[]): string {
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
