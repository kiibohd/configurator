import { Keyboard } from './common';
import * as usb from 'usb';

export * from './persistence';
export * from './common';

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

export interface DeviceData {
  busNo: number;
  path: string;
  vendorId: number;
  productId: number;
  manufacturer: Optional<string>;
  product: Optional<string>;
  serialNo: Optional<string>;
  version: number;
}

export interface AttachedKeyboard {
  keyboard: Keyboard;
  device: Optional<DeviceData>;
}
