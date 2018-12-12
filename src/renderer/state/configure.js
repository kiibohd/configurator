import { createSharedState } from '../shared-state/index';
import { locales } from '../../common/keys';
import { normalize, mangle } from '../../common/config/index';
import { uuidv4 } from '../../common/utils';
import _ from 'lodash';

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
  selected: undefined,
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

export { useConfigureState };

export function reset() {
  setConfigureState('layer', 0);
  setConfigureState('layout', undefined);
  setConfigureState('selected', undefined);
  setConfigureState('keyboardHidden', false);
  setConfigureState('raw', undefined);
  setConfigureState('headers', undefined);
  setConfigureState('matrix', undefined);
  setConfigureState('defines', undefined);
  setConfigureState('leds', undefined);
  setConfigureState('custom', undefined);
  setConfigureState('animations', undefined);
  setConfigureState('macros', undefined);
}

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
}

export function currentConfig() {
  const mangled = mangle({
    header: getConfigureState('headers'),
    defines: getConfigureState('defines'),
    matrix: getConfigureState('matrix'),
    leds: getConfigureState('leds'),
    custom: getConfigureState('custom'),
    animations: getConfigureState('animations'),
    macros: getConfigureState('macros')
  });

  return {
    ...getConfigureState('raw'),
    ...mangled
  };
}

export function updateSelected(key) {
  const selected = getConfigureState('selected');
  if (!selected) return;
  const layer = getConfigureState('layer');
  setConfigureState('matrix', matrix => {
    var updated = matrix.map(k => {
      if (k !== selected) return k;
      const copy = { ...k };
      copy.layers[layer.toString()] = key;
      setConfigureState('selected', copy);
      return copy;
    });

    return updated;
  });
}

export function updateCustomKll(kll) {
  const layer = getConfigureState('layer');
  setConfigureState('custom', custom => {
    return { ...custom, ...{ [layer.toString()]: kll } };
  });
}

export function updateHeader(name, value) {
  setConfigureState('headers', headers => ({ ...headers, ...{ [name]: value } }));
}

export function updateDefine(id, name, value) {
  setConfigureState('defines', defines => defines.map(d => (d.id === id ? { id, name, value } : d)));
}

export function addDefine(name, value) {
  const id = uuidv4();
  setConfigureState('defines', defines => [...defines, { id, name, value }]);
}

export function deleteDefine(id) {
  setConfigureState('defines', defines => defines.filter(d => d.id !== id));
}

export function addAnimation(name) {
  setConfigureState('animations', curr => ({ ...curr, ...{ [name]: { settings: '', frames: '' } } }));
}

export function renameAnimation(prev, updated) {
  setConfigureState('animations', animations => ({ ..._.omit(animations, prev), ...{ [updated]: animations[prev] } }));
}

export function updateAnimation(name, data) {
  setConfigureState('animations', animations => {
    const curr = animations[name];
    return { ...animations, ...{ [name]: { ...curr, ...data } } };
  });
}

export function deleteAnimation(name) {
  setConfigureState('animations', curr => _.omit(curr, name));
}
