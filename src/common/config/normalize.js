import { getKeyFromAlias } from '../keys/firmware';
import { mergeKeys } from '../keys/index';
import { uuidv4 } from '../utils';
import { Injection } from './common';
import _ from 'lodash';

/**
 * @param {import('./types').PersistedKey} layer
 * @param {import('../keys/en-us').Locale} locale
 * @returns {import('./types').ConfigKey}
 */
function normalizeLayer(layer, locale) {
  const fw = getKeyFromAlias(layer.key);

  if (fw) {
    const localized = locale.keyname2key[fw.name] || {};
    const merged = mergeKeys(fw, localized);

    return merged;
  }

  // custom kll on the key
  return {
    key: 'cust/raw',
    label1: layer.label && layer.label.length ? layer.label : 'RAW',
    style: { fontStyle: 'oblique' },
    custom: layer.key
  };
}

/**
 * @param {string} value
 */
function stripInjections(value) {
  let dejected = value;
  let start = dejected.indexOf(Injection.start);
  while (start >= 0) {
    const end = dejected.indexOf(Injection.end);
    dejected = dejected.substring(0, start) + dejected.substring(end + Injection.end.length);
    start = dejected.indexOf(Injection.start);
  }

  return dejected;
}

/**
 *
 * @param {import('./types').PersistedConfig} config
 * @param {import('../keys/en-us').Locale} locale
 * @returns {import('./types').Config}
 */
export function normalize(config, locale) {
  const minLeft = _.minBy(config.matrix, 'x').x;
  const minTop = _.minBy(config.matrix, 'y').y;

  const matrix = config.matrix.map(k => ({
    ...k,
    ...{ x: k.x - minLeft, y: k.y - minTop, layers: _.mapValues(k.layers, l => normalizeLayer(l, locale)) }
  }));

  // Defines need a unique id
  const defines = !config.defines ? [] : config.defines.map(x => ({ ...x, ...{ id: uuidv4() } }));
  // Macros also need the unique id.
  const macros = !config.macros ? {} : _.mapValues(config.macros, xs => xs.map(x => ({ ...x, ...{ id: uuidv4() } })));

  const custom = _.mapValues(config.custom, stripInjections) || {};

  const animations = _.mapValues(config.animations, a => ({
    ...a,
    ...{
      frames: a.frames.map(f => (_.trimStart(f).length && !_.trimStart(f).startsWith('#') ? f + ';' : f)).join('\n')
    }
  }));

  // TODO: Identify custom macros...

  return {
    ...config,
    ...{
      header: config.header || {},
      matrix,
      defines,
      leds: config.leds || [],
      custom,
      animations: animations || {},
      macros
    }
  };
}
