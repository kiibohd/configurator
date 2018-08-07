import enUsLocale from './en-us';

export const locales = {
  'en-us': enUsLocale
};

export function mergeKeys(firmware, locale) {
  if (firmware.name === 'fw/clear') return null;

  return {
    key: firmware.name,
    label1: locale.label1 || firmware.label,
    label2: locale.label2,
    label3: locale.label3,
    style: firmware.style
  };
}
