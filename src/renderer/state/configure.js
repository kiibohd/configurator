import { createSharedState } from '../shared-state/index';
import { locales } from '../../common/keys';
import { normalize, mangle } from '../../common/config/index';
import { uuidv4 } from '../../common/utils';
import _ from 'lodash';
import { Injection, stripInjection } from '../../common/config/common';

/**
 * @typedef LedStatus
 * @property {number} id
 * @property {number} r
 * @property {number} g
 * @property {number} b
 */

/**
 * @type{{
 *  loading: boolean
 *  layout: string
 *  layer: number
 *  raw: import('../../common/config/types').PersistedConfig
 *  headers: Object<string, string>
 *  matrix: import('../../common/config/types').ConfigMatrix
 *  defines: import('../../common/config/types').ConfigDefine[]
 *  leds: import('../../common/config/types').ConfigLed[]
 *  custom: Object<string, string>
 *  animations: Object<string, import('../../common/config/types').ConfigAnimation>
 *  macros: import('../../common/config/types').ConfigMacros
 *  canned: Object<string, import('../../common/config/types').ConfigCannedAnimation>
 *  selected: import('../../common/config/types').ConfigMatrixItem
 *  selectedLeds: number[]
 *  ledStatus: Object<string, LedStatus>
 *  keyboardHidden: boolean
 *  ui: {backdropPadding: number, sizeFactor: number, ledFactor: number}
 * }}
 */
const initialState = {
  loading: false,
  layout: undefined,
  layer: 0,
  raw: undefined,
  headers: undefined,
  matrix: undefined,
  defines: undefined,
  leds: undefined,
  custom: undefined,
  animations: undefined,
  macros: undefined,
  canned: undefined,
  selected: undefined,
  selectedLeds: [],
  ledStatus: {},
  keyboardHidden: false,
  ui: {
    backdropPadding: 20,
    sizeFactor: 16,
    ledFactor: 17
  }
};

const {
  useSharedState: useConfigureState,
  setSharedState: setConfigureState,
  getSharedState: getConfigureState
} = createSharedState(initialState);

export { useConfigureState, setConfigureState };

export function reset() {
  setConfigureState('layer', 0);
  setConfigureState('layout', undefined);
  setConfigureState('selected', undefined);
  setConfigureState('selectedLeds', []);
  setConfigureState('keyboardHidden', false);
  setConfigureState('raw', undefined);
  setConfigureState('headers', undefined);
  setConfigureState('matrix', undefined);
  setConfigureState('defines', undefined);
  setConfigureState('leds', undefined);
  setConfigureState('custom', undefined);
  setConfigureState('animations', undefined);
  setConfigureState('macros', undefined);
  setConfigureState('canned', undefined);
}

/**
 * @param {import('../../common/config/types').PersistedConfig} raw
 * @param {string} locale
 */
export function updateConfig(raw, locale) {
  setConfigureState('raw', raw);
  const normalized = normalize(raw, locales[locale]);
  setConfigureState('headers', normalized.header);
  setConfigureState('matrix', normalized.matrix);
  setConfigureState('defines', normalized.defines);
  setConfigureState('leds', normalized.leds);
  setConfigureState('custom', normalized.custom);
  setConfigureState('animations', normalized.animations);
  setConfigureState('macros', normalized.macros);
  setConfigureState('canned', normalized.canned);
}

/**
 * @returns {import('../../common/config/types').PersistedConfig}
 */
export function currentConfig() {
  const mangled = mangle({
    header: getConfigureState('headers'),
    defines: getConfigureState('defines'),
    matrix: getConfigureState('matrix'),
    leds: getConfigureState('leds'),
    custom: getConfigureState('custom'),
    animations: getConfigureState('animations'),
    macros: getConfigureState('macros'),
    canned: getConfigureState('canned')
  });

  return {
    ...getConfigureState('raw'),
    ...mangled
  };
}

/**
 * @param {import('../../common/config/types').ConfigKey} key
 */
export function updateSelected(key) {
  const selected = getConfigureState('selected');
  if (!selected) return;
  const updated = updateKeymap(selected, key);
  setConfigureState('selected', updated);
}

/**
 * @param {import('../../common/config/types').ConfigMatrixItem} target
 * @param {import('../../common/config/types').ConfigKey} key
 */
export function updateKeymap(target, key) {
  const layer = getConfigureState('layer');
  let newDef = undefined;
  setConfigureState('matrix', matrix => {
    var updated = matrix.map(k => {
      if (k !== target) return k;
      newDef = { ...k };
      newDef.layers[layer.toString()] = key;
      return newDef;
    });

    return updated;
  });

  return newDef;
}

/**
 * @param {string} kll
 * @param {number} layer
 */
export function updateCustomKll(kll, layer) {
  if (_.isNil(layer)) {
    layer = getConfigureState('layer');
  }
  setConfigureState('custom', custom => {
    return { ...custom, ...{ [layer.toString()]: kll } };
  });
}

/**
 * @param {string} name
 * @param {string} value
 */
export function updateHeader(name, value) {
  setConfigureState('headers', headers => ({ ...headers, ...{ [name]: value } }));
}

/**
 * @param {string} id
 * @param {string} name
 * @param {string} value
 */
export function updateDefine(id, name, value) {
  setConfigureState('defines', defines => defines.map(d => (d.id === id ? { id, name, value } : d)));
}

/**
 * @param {string} name
 * @param {string} value
 */
export function addDefine(name, value) {
  const id = uuidv4();
  setConfigureState('defines', defines => [...defines, { id, name, value }]);
}

/**
 * @param {string} id
 */
export function deleteDefine(id) {
  setConfigureState('defines', defines => defines.filter(d => d.id !== id));
}

/**
 * @param {string} name
 * @param {"static"|"custom"|"canned"} type
 * @param {Partial<import('../../common/config/types').ConfigAnimation>} data
 */
export function addAnimation(name, type = 'custom', data = {}) {
  const merged = { ...{ type, settings: '', frames: '' }, ...data };
  merged.type = type;
  setConfigureState('animations', curr => ({ ...curr, ...{ [name]: merged } }));
}

/**
 * @param {string} prev
 * @param {string} updated
 */
export function renameAnimation(prev, updated) {
  setConfigureState('animations', animations => ({ ..._.omit(animations, prev), ...{ [updated]: animations[prev] } }));
}

/**
 * @param {string} name
 * @param {Partial<import('../../common/config/types').ConfigAnimation>} data
 */
export function updateAnimation(name, data) {
  setConfigureState('animations', animations => {
    const curr = animations[name];
    return { ...animations, ...{ [name]: { ...curr, ...data } } };
  });
}

/**
 * @param {string} name
 */
export function deleteAnimation(name) {
  setConfigureState('animations', curr => _.omit(curr, name));
  const inj = Injection.animation;
  const start = inj.start.replace(inj.tokenRx, name);
  const end = inj.end.replace(inj.tokenRx, name);
  setConfigureState('custom', c => _.mapValues(c, kll => stripInjection(kll, start, end)));
}

/**
 * @param {string|number} layer
 * @param {import('../../common/config/types').ConfigMacro} macro
 * @param {import('../../common/config/types').ConfigMacro} updated
 */
export function updateMacro(layer, macro, updated) {
  setConfigureState('macros', macros => {
    const currLayer = [...macros[layer]];
    const idx = _.indexOf(currLayer, macro);
    const updLayer = [...currLayer];
    updLayer[idx] = updated;

    const updMacros = _.omit(macros, layer);
    updMacros[layer] = updLayer;
    return updMacros;
  });
}

/**
 * @param {string|number} layer
 */
export function addMacro(layer) {
  const macro = { id: uuidv4(), name: 'New Macro', trigger: [[]], output: [[]] };
  setConfigureState('macros', macros => {
    const updLayer = [...(macros[layer] || []), macro];
    const updMacros = _.omit(macros, layer);
    updMacros[layer] = updLayer;
    return updMacros;
  });
}

/**
 * @param {string|number} layer
 * @param {import('../../common/config/types').ConfigMacro} macro
 */
export function deleteMacro(layer, macro) {
  setConfigureState('macros', macros => {
    const currLayer = [...macros[layer]];

    const updMacros = _.omit(macros, layer);
    updMacros[layer] = _.without(currLayer, macro);
    return updMacros;
  });
}

/**
 * @param {number[]} leds
 */
export function addSelectedLeds(leds) {
  setConfigureState('selectedLeds', selected => [...selected, ...leds]);
}

/**
 * @param {number[]} leds
 */
export function setSelectedLeds(leds) {
  setConfigureState('selectedLeds', leds || []);
}

/**
 * @param {number} id
 * @param {LedStatus} status
 */
export function setLedStatus(id, status) {
  setConfigureState('ledStatus', ledStatus => ({ ...ledStatus, ...{ [id]: status } }));
}

/**
 * @param {LedStatus} status
 */
export function setAllLeds(status) {
  setConfigureState('ledStatus', status);
}

/**
 * @param {number} id
 */
export function clearLedStatus(id) {
  setConfigureState('ledStatus', ledStatus => _.omit(ledStatus, id));
}
