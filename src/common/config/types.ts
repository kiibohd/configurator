import { Rgb } from '../utils/color';

/** External Types */
export type PersistedLayer = string;

export interface PersistedKey {
  key: string;
  label: string;
}

export interface PersistedMatrixItem {
  code: string;
  board?: number;
  x: number;
  y: number;
  w: number;
  h: number;
  layers: Dictionary<PersistedKey>;
}

export type PersistedMatrix = PersistedMatrixItem[];

export interface PersistedLed {
  id: number;
  x: number;
  y: number;
  scanCode?: string;
}

export type PersistedDefine = NameValue<string, string>;

export interface PersistedAnimation {
  type: 'custom' | 'canned' | 'static';
  settings: string;
  frames: string[];
}

export interface PersistedCannedConfigurableItem {
  name: string;
  type: 'color' | 'select';
  default: Rgb | string | number;
  values?: NameValue<string, string | number>[];
}

export interface PersistedCannedAnimation {
  settings: string;
  type: 'animation' | 'trigger';
  description: string;
  configurable: PersistedCannedConfigurableItem[];
  frames: string[];
  'custom-kll': string;
  version?: number;
}

export interface PersistedMacro {
  name: string;
  trigger: string[][];
  output: string[][];
}

export interface PersistedConfig {
  matrix: PersistedMatrix;
  header: Dictionary<string>;
  defines: PersistedDefine[];
  leds: PersistedLed[];
  animations: Dictionary<PersistedAnimation>;
  macros: Dictionary<PersistedMacro[]>;
  custom: Dictionary<string>;
  canned: Dictionary<PersistedCannedAnimation>;
}

/** Internal Types */
// TODO: The 'Config' Prefix needs to go.

export interface ConfigKey {
  key: string;
  label1: string;
  label2?: string;
  label3?: string;
  // TODO - Make this a CSS Object
  style: Record<string, unknown>;
  custom?: string;
}

export interface ConfigMatrixItem {
  code: string;
  board?: number;
  x: number;
  y: number;
  w: number;
  h: number;
  layers: Dictionary<ConfigKey>;
}

export type ConfigMatrix = ConfigMatrixItem[];

export interface ConfigLed {
  id: number;
  x: number;
  y: number;
  scanCode?: string;
}

export interface ConfigDefine {
  id: string;
  name: string;
  value: string;
}

export interface ConfigAnimation {
  type: 'custom' | 'canned' | 'static';
  settings: string;
  frames: string;
}

export interface ConfigCannedConfigurableItem {
  name: string;
  type: 'color' | 'select';
  default: Rgb | string | number;
  values?: NameValue<string, string | number>[];
}

export interface ConfigCannedAnimation {
  settings: string;
  type: 'animation' | 'trigger';
  description: string;
  configurable: ConfigCannedConfigurableItem[];
  frames: string[];
  'custom-kll': string;
  version?: number;
}

export interface ConfigMacro {
  id: string;
  name: string;
  trigger: string[][];
  output: string[][];
}

export type ConfigMacros = Dictionary<ConfigMacro[]>;

export interface Config {
  matrix: ConfigMatrix;
  header: Dictionary<string>;
  defines: ConfigDefine[];
  leds: ConfigLed[];
  animations: Dictionary<ConfigAnimation>;
  macros: ConfigMacros;
  custom: Dictionary<string>;
  canned: Dictionary<ConfigCannedAnimation>;
}

// TODO: Move out of here
export interface FirmwareDetails {
  commit: number;
  date: string;
  hash: string;
  bcd: string;
  notes: string;
}

export type FirmwareChannels = 'lts' | 'latest' | 'nightly';

export type FirmwareVersions = ConstrainedDictionary<FirmwareChannels, FirmwareDetails>;
