import _ from 'lodash';
import { getKeyFromAlias, getKey } from '../keys/firmware';
import { mergeKeys } from '../keys/index';
import { uuidv4 } from '../utils';

/**
 * @typedef {Object<string, any>} ConfigKey
 * @property {string} key
 * @property {string} label
 */

/**
 * @typedef {Object<string, any>} ConfigMatrix
 */

/**
 * @typedef {Object<string, any>} ConfigLed
 */

/**
 * @typedef {Object<string, any>} ConfigDefine
 * @property {string} name
 * @property {string} value
 */

/**
 * @typedef {Object<string, any>} ConfigAnimation
 */

/**
 * @typedef {Object<string, any>} ConfigMacro
 */

/**
 * @typedef {Object<string, any>} Config
 * @property {ConfigMatrix[]} matrix
 * @property {Object<string, string>} header
 * @property {ConfigDefine[]} defines
 * @property {ConfigLed[]} leds
 * @property {ConfigAnimation[]} animations
 * @property {ConfigMacro[]} macros
 * @property {Object<string, string>} custom
 */

/**
 * @param {ConfigKey} layer
 * @param {import('../keys/en-us').Locale} locale
 */
function normalizeLayer(layer, locale) {
  const fw = getKeyFromAlias(layer.key);
  const localized = locale.keyname2key[fw.name] || {};
  const merged = mergeKeys(fw, localized);

  return merged;
}

/**
 *
 * @param {Config} config
 * @param {import('../keys/en-us').Locale} locale
 */
export function normalize(config, locale) {
  const minLeft = _.minBy(config.matrix, 'x').x;
  const minTop = _.minBy(config.matrix, 'y').y;

  const matrix = config.matrix.map(k => ({
    ...k,
    ...{ x: k.x - minLeft, y: k.y - minTop, layers: _.mapValues(k.layers, l => normalizeLayer(l, locale)) }
  }));

  // Defines need a unique id so symbol is perfect.
  const defines = !config.defines ? [] : config.defines.map(x => ({ ...x, ...{ id: uuidv4() } }));

  // TODO: Identify custom macros...

  return {
    ...config,
    ...{
      header: config.header || {},
      matrix,
      defines,
      leds: config.leds || [],
      custom: config.custom || {},
      animations: config.animations || {},
      macros: config.macros || {}
    }
  };
}

function mangleLayer(layer) {
  const key = getKey(layer.key);
  return {
    key: _.head(key.aliases),
    label: key.label
  };
}

export function mangle(config) {
  return {
    header: config.header,
    defines: config.defines.map(d => _.omit(d, 'id')),
    matrix: config.matrix.map(k => ({ ...k, ...{ layers: _.mapValues(k.layers, mangleLayer) } })),
    leds: config.leds,
    custom: config.custom,
    animations: config.animations,
    macros: config.macros
  };
}

export function getSize(matrix, scaleFactor = 1) {
  const right = _.maxBy(matrix, k => k.x + k.w);
  const bottom = _.maxBy(matrix, k => k.y + k.h);

  return {
    height: (bottom.y + bottom.h) * scaleFactor,
    width: (right.x + right.w) * scaleFactor
  };
}
