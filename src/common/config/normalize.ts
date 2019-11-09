import { getKeyFromAlias } from '../keys/firmware';
import { mergeKeys, Locale, LocalizedKey } from '../keys/index';
import { uuidv4 } from '../utils';
import { Injection, stripInjection, framesToString } from './common';
import _ from 'lodash';
import { Config, ConfigKey, PersistedKey, PersistedConfig } from './types';

// TODO: Remove the `null` usage
function normalizeLayer(layer: PersistedKey, locale: Locale): ConfigKey | null {
  const fw = getKeyFromAlias(layer.key);

  if (fw) {
    // TODO: This is a type unsafe mess...
    const localized = (locale.keyname2key[fw.name] || fw.data || {}) as LocalizedKey;
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

export function normalize(config: PersistedConfig, locale: Locale): Config {
  const minLeft = (_.minBy(config.matrix, 'x') ?? { x: 0 }).x;
  const minTop = (_.minBy(config.matrix, 'y') ?? { y: 0 }).y;

  const matrix = config.matrix.map(k => ({
    ...k,
    ...{ x: k.x - minLeft, y: k.y - minTop, layers: _.mapValues(k.layers, l => normalizeLayer(l, locale)) }
  }));

  // Defines need a unique id
  const defines = !config.defines ? [] : config.defines.map(x => ({ ...x, ...{ id: uuidv4() } }));
  // Macros also need the unique id.
  const macros = !config.macros ? {} : _.mapValues(config.macros, xs => xs.map(x => ({ ...x, ...{ id: uuidv4() } })));

  const custom =
    _.mapValues(config.custom, c => stripInjection(c, Injection.compile.start, Injection.compile.end)) || {};

  const animations = _.mapValues(config.animations, a => ({
    ...a,
    ...{
      frames: framesToString(a.frames)
    }
  }));

  // TODO: Identify custom macros...

  // TODO: Fix this type mess...
  return {
    ...config,
    ...{
      header: config.header || {},
      matrix,
      defines,
      leds: config.leds || [],
      custom,
      animations: animations || {},
      macros,
      canned: config.canned || {}
    }
  } as Config;
}
