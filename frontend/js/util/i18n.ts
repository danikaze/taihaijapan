import { Dict } from '../../../interfaces/frontend';

export function t(text: string, data: Dict<string>) {
  let txt = text;

  Object.keys(data).forEach((key) => {
    txt = txt.replace(new RegExp(`\\{${key}\\}`, 'g'), data[key]);
  });

  return txt;
}
