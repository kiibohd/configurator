import { keymap, aliases } from './predefined';
import { parseRawToKnown } from './known-actions';
/**
 * @param {Partial<import('.').DisplayKey>} custom
 * @return {import('./predefined').PredefinedKey}
 */
function customToPredefined(custom) {
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

/**
 * @param {Partial<import('.').DisplayKey>} display
 * @return {import('./predefined').PredefinedKey}
 */
export function getKey(display) {
  const name = display.key;

  if (name.startsWith('cust/')) {
    return customToPredefined(display);
  }

  const predef = keymap[name];

  if (predef) {
    return predef;
  }
}

/**
 * @param {string} alias
 * @returns {import('./predefined').PredefinedKey}
 */
export function getKeyFromAlias(alias) {
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
}
