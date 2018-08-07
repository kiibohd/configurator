import { keymap, aliases } from './predefined';

export function getKey(name) {
  const predef = keymap[name];

  if (predef) {
    return predef;
  }

  // TODO: Custom macros...
}

export function getKeyFromAlias(alias) {
  // Normalize the alias so we don't have spaces (helps with macros, etc)
  const normalized = alias.replace(/\s/g, '');
  const known = aliases[normalized];
  if (known) {
    return known;
  }

  // TODO: Custom macros...
}
