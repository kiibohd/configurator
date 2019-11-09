import enUsLocale from './en-us';
import { LocalizedKey, PredefinedKey, DisplayKey } from './types';

export * from './types';

export const locales = {
  'en-us': enUsLocale
};

export type AvailableLocales = keyof typeof locales;

// TODO: Remove `null` return
// TODO: Key type seems off...
// TODO: This should use an Algebraic Data Structure to distinguish between types, will fix the mess
export function mergeKeys(firmware: PredefinedKey, locale: LocalizedKey | DisplayKey): DisplayKey | null {
  if (firmware.name === 'fw/clear') return null;
  // const custom = firmware && firmware.name && firmware.name.startsWith('cust/');

  return {
    key: firmware.name,
    label1: locale.label1 || firmware.label,
    label2: locale.label2,
    label3: locale.label3,
    style: firmware.style,
    custom: (locale as DisplayKey).custom,
    data: (locale as DisplayKey).data
  };
}
