export { default as ModedTextField } from './moded-text-field';
export { default as SwatchedChromePicker } from './swatched-chrome-picker';

/**
 * @param {string} relpath
 */
export function pathToImg(relpath) {
  //@ts-ignore
  return `file:${__static}/${relpath}`;
}
