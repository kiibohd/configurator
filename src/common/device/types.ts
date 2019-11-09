import * as usb from 'usb';

export interface UsbIdentifier {
  vendorId: number;
  productId: number;
}

export interface Device {
  raw: usb.Device;
  connected: boolean;
  openable: boolean;
  busNo: number;
  path: string;
  vendorId: number;
  productId: number;
  manufacturer: Optional<string>;
  product: Optional<string>;
  serialNo: Optional<string>;
  version: number;
}

export interface KnownDevice {
  vid: number;
  pid: number;
  isFlashable: boolean;
  isUnique: boolean;
  names: string[];
  variant: Optional<string>;
}

export interface ExtendedInfo {
  resetCombo?: string;
  isSplit?: boolean;
}

export interface Keyboard {
  display: string;
  names: string[];
  variants: string[];
  visuals: boolean;
  layouts: Dictionary<string[]>;
  info?: ExtendedInfo;
}

export interface AttachedKeyboard {
  keyboard: Keyboard;
  known: Optional<KnownDevice>;
  connected: boolean;
  openable: boolean;
  raw?: usb.Device;
  busNo?: number;
  path?: string;
  vendorId?: number;
  productId?: number;
  manufacturer?: Optional<string>;
  product?: Optional<string>;
  serialNo?: Optional<string>;
  version?: number;
}

export interface KeyDetails {
  size: number;
  left: number;
  isSpace: boolean;
  isDifference: boolean;
  isVertical: boolean;
}

export interface KeyboardDetails {
  name: string;
  rows: number[];
  keys: KeyDetails[][];
}
