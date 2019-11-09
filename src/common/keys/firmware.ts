import { keymap, aliases } from './predefined';
import { parseRawToKnown } from './known-actions';
import { CustomKey, BaseKey, PredefinedKey } from './types';

function customToPredefined(custom: CustomKey): PredefinedKey {
  return {
    name: custom.key,
    label: custom.label1,
    aliases: [custom.custom],
    triggerDef: 0,
    resultDef: 0,
    group: undefined,
    order: 0,
    style: custom.style || {},
    data: custom
  };
}

export function getKey(display: BaseKey | CustomKey): Optional<PredefinedKey> {
  const name = display.key;

  if (name.startsWith('cust/')) {
    return customToPredefined(display as CustomKey);
  }

  const predef = keymap[name];

  if (predef) {
    return predef;
  }

  return undefined;
}

export function getKeyFromAlias(alias: string): Optional<PredefinedKey> {
  // Normalize the alias so we don't have spaces (helps with macros, etc)
  let normalized = alias.replace(/\s/g, '');
  normalized = normalized.toUpperCase();
  const known = aliases[normalized];
  if (known) {
    return known;
  }

  const action = parseRawToKnown(alias);
  if (action) {
    return customToPredefined(action);
  }

  return undefined;
}
