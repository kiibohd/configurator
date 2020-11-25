import { PersistedConfig, ConfigCannedAnimation } from '../config';

export interface KeyboardFamily {
  keyboards: Keyboard[];
  image: Image;
}

export interface Image {
  data: string;
  width: number;
  height: number;
}

export interface Keyboard {
  keyboard: string;
  display: string;
  image: Image;
  aliases: string[];
  variants: Variant[];
}

export interface DeviceIdentifier {
  vid: number;
  pid: number;
  flash: boolean;
}

export interface Variant {
  name: string;
  display: string;
  identities: DeviceIdentifier[];
  isSplit: boolean;
  resetCombo: string;
  visuals: 'none' | 'single-color' | 'rgb';
  physical?: PhysicalLayout;
  layouts: Layout[];
  animations: {
    canned?: Dictionary<ConfigCannedAnimation>;
  };
}

export interface PhysicalLayout {
  rows: number[];
  keys: KeyDetails[][];
}

export interface KeyDetails {
  size: number;
  left: number;
  isSpace: boolean;
  isDifference: boolean;
  isVertical: boolean;
}

export interface Layout {
  name: string;
  display: string;
  config: PersistedConfig;
}
