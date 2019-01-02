import { getKeyFromAlias, getKey } from '../keys/firmware';
import { Injection, validMacro } from './common';
import _ from 'lodash';

/**
 * @param {import('./types').ConfigKey} layer
 * @returns {import('./types').PersistedKey}
 */
function mangleLayer(layer) {
  const key = getKey(layer);
  return {
    key: key.aliases[key.resultDef],
    label: key.label
  };
}

/**
 * @param {import('./types').ConfigMacro} macro
 * @returns {string}
 */
function macroToKll(macro) {
  if (!validMacro(macro)) {
    return `# Skipped Invalid Macro '${macro.name}'`;
  }

  const toKll = alias => {
    if (alias.startsWith('#:')) {
      return alias.substring(2);
    } else if (alias.startsWith('CONS:')) {
      return `CONS"${alias.substring(5)}"`;
    } else if (alias.startsWith('SYS:')) {
      return `SYS"${alias.substring(5)}"`;
    }

    return `U"${alias}"`;
  };
  const mapSeq = (seq, isTrigger) => {
    return seq
      .map(combo =>
        combo
          .map(alias => {
            const key = getKeyFromAlias(alias);
            const normalizedAlias = key.aliases[isTrigger ? key.triggerDef : key.resultDef];
            const kll = toKll(normalizedAlias);
            return kll;
          })
          .join(' + ')
      )
      .join(', ');
  };
  const comment = `# Macro '${macro.name}'`;
  const trigger = mapSeq(macro.trigger, true);
  const result = mapSeq(macro.output, false);

  return `${comment}\n${trigger} : ${result};`;
}

/**
 * @param {import('./types').Config} config
 * @returns {import('./types').PersistedConfig}
 */
export function mangle(config) {
  // Inject layer macros into custom kll
  const custom = { ...config.custom };
  const inj = Injection.animation;
  _.forOwn(config.macros, (xs, layer) => {
    custom[layer] = (custom[layer] || '') + inj.start + xs.map(macroToKll).join('\n') + inj.end;
  });

  return {
    header: config.header,
    defines: config.defines.map(d => _.omit(d, 'id')),
    matrix: config.matrix.map(k => ({ ...k, ...{ layers: _.mapValues(k.layers, mangleLayer) } })),
    leds: config.leds,
    custom,
    animations: _.mapValues(config.animations, a => ({
      ...a,
      ...{ frames: a.frames.split(/;[\n]*/m).filter(x => x && x.length) }
    })),
    macros: _.mapValues(config.macros, xs => xs.map(x => _.omit(x, 'id'))),
    canned: config.canned
  };
}
