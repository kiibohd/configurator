import { getKeyFromAlias, getKey } from '../keys/firmware';
import { Injection, validMacro } from './common';
import _ from 'lodash';
import { Config, ConfigKey, PersistedKey, ConfigMacro, PersistedConfig } from './types';

function mangleLayer(layer: ConfigKey): PersistedKey {
  const key = getKey(layer);

  // TODO: Is this an error, or just skip it?
  if (!key) {
    throw Error('invalid key');
  }

  return {
    key: key.aliases[key.resultDef],
    label: key.label
  };
}

function macroToKll(macro: ConfigMacro): string {
  if (!validMacro(macro)) {
    return `# Skipped Invalid Macro '${macro.name}'`;
  }

  const toKll = (alias: string) => {
    if (alias.startsWith('#:')) {
      return alias.substring(2);
    } else if (alias.startsWith('CONS:')) {
      return `CONS"${alias.substring(5)}"`;
    } else if (alias.startsWith('SYS:')) {
      return `SYS"${alias.substring(5)}"`;
    }

    return `U"${alias}"`;
  };
  const mapSeq = (seq: string[][], isTrigger: boolean) => {
    return seq
      .map(combo =>
        combo
          .map(alias => {
            const key = getKeyFromAlias(alias);
            // TODO: Handle this error better...
            if (!key) {
              return '';
            }
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

export function mangle(config: Config): PersistedConfig {
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
