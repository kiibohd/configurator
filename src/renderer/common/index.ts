export { default as ModedTextField } from './moded-text-field';
export { default as SwatchedChromePicker } from './swatched-chrome-picker';

export function pathToImg(relpath: string): string {
  return `file:${__static}/${relpath}`;
}
