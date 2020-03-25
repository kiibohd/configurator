import { createSharedState } from '../shared-state/index';
import { locales, AvailableLocales } from '../../common/keys';
import {
  normalize,
  mangle,
  PersistedConfig,
  ConfigMatrix,
  ConfigDefine,
  ConfigLed,
  ConfigAnimation,
  ConfigMacros,
  ConfigCannedAnimation,
  ConfigMatrixItem,
  ConfigMacro,
  ConfigKey,
} from '../../common/config/index';
import { uuidv4, Rgb } from '../../common/utils';
import _ from 'lodash';
import { Injection, stripInjection } from '../../common/config/common';

export interface LedStatus extends Rgb {
  id: number;
}

export interface UISizing {
  backdropPadding: number;
  sizeFactor: number;
  ledFactor: number;
}

type ConfigureState = {
  loading: boolean;
  layout: Optional<string>;
  layer: number;
  raw: Optional<PersistedConfig>;
  headers: Optional<Dictionary<string>>;
  matrix: Optional<ConfigMatrix>;
  defines: Optional<ConfigDefine[]>;
  leds: Optional<ConfigLed[]>;
  custom: Optional<Dictionary<string>>;
  animations: Optional<Dictionary<ConfigAnimation>>;
  macros: Optional<ConfigMacros>;
  canned: Optional<Dictionary<ConfigCannedAnimation>>;
  selected: Optional<ConfigMatrixItem>;
  selectedLeds: number[];
  ledStatus: SparseArray<LedStatus>;
  keyboardHidden: boolean;
  ui: UISizing;
};

const initialState: ConfigureState = {
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
    ledFactor: 17,
  },
};

const {
  useSharedState: useConfigureState,
  setSharedState: setConfigureState,
  getSharedState: getConfigureState,
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

export function updateConfig(raw: PersistedConfig, locale: AvailableLocales) {
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

export function currentConfig(): PersistedConfig {
  const mangled = mangle({
    header: getConfigureState('headers') ?? {},
    defines: getConfigureState('defines') ?? [],
    matrix: getConfigureState('matrix') ?? [],
    leds: getConfigureState('leds') ?? [],
    custom: getConfigureState('custom') ?? {},
    animations: getConfigureState('animations') ?? {},
    macros: getConfigureState('macros') ?? {},
    canned: getConfigureState('canned') ?? {},
  });

  return {
    ...getConfigureState('raw'),
    ...mangled,
  };
}

export function updateKeymap(target: ConfigMatrixItem, key: ConfigKey | null) {
  const layer = getConfigureState('layer');
  let newDef = undefined;
  setConfigureState('matrix', (matrix = []) => {
    const updated = matrix.map((k) => {
      if (k !== target) return k;
      newDef = { ...k };
      if (key === null) {
        delete newDef.layers[layer.toString()];
      } else {
        newDef.layers[layer.toString()] = key;
      }
      return newDef;
    });

    return updated;
  });

  return newDef;
}

export function updateSelected(key: ConfigKey | null) {
  const selected = getConfigureState('selected');
  if (!selected) return;
  const updated = updateKeymap(selected, key);
  setConfigureState('selected', updated);
}

export function updateCustomKll(kll: string, layer?: number) {
  if (_.isNil(layer)) {
    layer = getConfigureState('layer');
  }

  setConfigureState('custom', (custom) => {
    return { ...custom, ...{ [(layer ?? 0).toString()]: kll } };
  });
}

export function updateHeader(name: string, value: string) {
  setConfigureState('headers', (headers) => ({ ...headers, ...{ [name]: value } }));
}

export function updateDefine(id: string, name: string, value: string) {
  setConfigureState('defines', (defines = []) => defines.map((d) => (d.id === id ? { id, name, value } : d)));
}

export function addDefine(name: string, value: string) {
  const id = uuidv4();
  setConfigureState('defines', (defines = []) => [...defines, { id, name, value }]);
}

export function deleteDefine(id: string) {
  setConfigureState('defines', (defines = []) => defines.filter((d) => d.id !== id));
}

export function addAnimation(
  name: string,
  type: ConfigAnimation['type'] = 'custom',
  data: Partial<ConfigAnimation> = {}
) {
  const merged = { ...{ type, settings: '', frames: '' }, ...data };
  merged.type = type;
  setConfigureState('animations', (curr) => ({ ...curr, ...{ [name]: merged } }));
}

export function renameAnimation(prev: string, updated: string) {
  setConfigureState('animations', (animations = {}) => ({
    ..._.omit(animations, prev),
    ...{ [updated]: animations[prev] },
  }));
}

export function updateAnimation(name: string, data: Partial<ConfigAnimation>) {
  setConfigureState('animations', (animations = {}) => {
    const curr = animations[name];
    return { ...animations, ...{ [name]: { ...curr, ...data } } };
  });
}

export function deleteAnimation(name: string) {
  setConfigureState('animations', (curr) => _.omit(curr, name));
  const inj = Injection.animation;
  const start = inj.start.replace(inj.tokenRx, name);
  const end = inj.end.replace(inj.tokenRx, name);
  setConfigureState('custom', (c) => _.mapValues(c, (kll) => stripInjection(kll, start, end)));
}

export function updateMacro(layer: number, macro: ConfigMacro, updated: ConfigMacro) {
  setConfigureState('macros', (macros = {}) => {
    const currLayer = [...macros[layer]];
    const idx = _.indexOf(currLayer, macro);
    const updLayer = [...currLayer];
    updLayer[idx] = updated;

    const updMacros = _.omit(macros, layer);
    updMacros[layer] = updLayer;
    return updMacros;
  });
}

export function addMacro(layer: number) {
  const macro = { id: uuidv4(), name: 'New Macro', trigger: [[]], output: [[]] };
  setConfigureState('macros', (macros = {}) => {
    const updLayer = [...(macros[layer] || []), macro];
    const updMacros = _.omit(macros, layer);
    updMacros[layer] = updLayer;
    return updMacros;
  });
}

export function deleteMacro(layer: number, macro: ConfigMacro) {
  setConfigureState('macros', (macros = {}) => {
    const currLayer = [...macros[layer]];

    const updMacros = _.omit(macros, layer);
    updMacros[layer] = _.without(currLayer, macro);
    return updMacros;
  });
}

export function addSelectedLeds(leds: number[]) {
  setConfigureState('selectedLeds', (selected) => [...selected, ...leds]);
}

export function setSelectedLeds(leds: number[]) {
  setConfigureState('selectedLeds', leds || []);
}

export function setLedStatus(id: number, status: LedStatus) {
  setConfigureState('ledStatus', (ledStatus) => ({ ...ledStatus, ...{ [id]: status } }));
}

export function setAllLeds(status: SparseArray<LedStatus>) {
  setConfigureState('ledStatus', status);
}

export function clearLedStatus(id: number) {
  setConfigureState('ledStatus', (ledStatus) => _.omit(ledStatus, id));
}
