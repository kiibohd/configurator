import _ from 'lodash';
import { getKeyFromAlias, getKey } from '../keys/firmware';
import { mergeKeys } from '../keys/index';
import { uuidv4 } from '../utils';
// TODO: Need to have the API Types and Internal Types for objects!

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
 * @typedef ConfigMacro
 * @property {string} id -- XXX Move to internal object definition XXX
 * @property {string} name
 * @property {string[][]} trigger
 * @property {string[][]} output
 */

/**
 * @typedef Config
 * @property {ConfigMatrix[]} matrix
 * @property {Object<string, string>} header
 * @property {ConfigDefine[]} defines
 * @property {ConfigLed[]} leds
 * @property {ConfigAnimation[]} animations
 * @property {Object<string, ConfigMacro[]>} macros
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

const injectStart = '\n#~~~START INJECTION~~~#\n';
const injectEnd = '\n#~~~END INJECTION~~~#\n';

/**
 *
 * @param {string} value
 */
function stripInjections(value) {
  let dejected = value;
  let start = dejected.indexOf(injectStart);
  while (start >= 0) {
    const end = dejected.indexOf(injectEnd);
    dejected = dejected.substring(0, start) + dejected.substring(end + injectEnd.length);
    start = dejected.indexOf(injectStart);
  }

  return dejected;
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

  // Defines need a unique id
  const defines = !config.defines ? [] : config.defines.map(x => ({ ...x, ...{ id: uuidv4() } }));
  // Macros also need the unique id.
  const macros = !config.macros ? {} : _.mapValues(config.macros, xs => xs.map(x => ({ ...x, ...{ id: uuidv4() } })));

  const custom = _.mapValues(config.custom, stripInjections) || {};

  const animations = _.mapValues(config.animations, a => ({
    ...a,
    ...{ frames: a.frames.map(f => (f.trimStart().length && !f.trimStart().startsWith('#') ? f + ';' : f)).join('\n') }
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

function mangleLayer(layer) {
  const key = getKey(layer.key);
  return {
    // TODO: Update for macros
    key: key.aliases[key.triggerDef],
    label: key.label
  };
}

/**
 *
 * @param {ConfigMacro} macro
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

export function mangle(config) {
  // Inject layer macros into custom kll
  const custom = { ...config.custom };
  _.forOwn(config.macros, (xs, layer) => {
    custom[layer] = (custom[layer] || '') + injectStart + xs.map(macroToKll).join('\n') + injectEnd;
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
    macros: _.mapValues(config.macros, xs => xs.map(x => _.omit(x, 'id')))
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

/**
 * @param {ConfigMacro} macro
 * @return {boolean}
 */
export function validMacro(macro) {
  return (
    macro.name.length &&
    macro.output.length &&
    !macro.output.some(x => !x.length || x.includes('')) &&
    macro.trigger.length &&
    !macro.output.some(x => !x.length || x.includes(''))
  );
}
