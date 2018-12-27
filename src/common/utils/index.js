/**
 * A non-cryptographically secure generation for uuidv4 strings.
 * SEE: https://stackoverflow.com/a/2117523/449822
 */
export function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export { luminance, contrastRatio } from './color';
