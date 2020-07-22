import Bluebird from 'bluebird';
import EventEmitter from 'events';
import log from 'loglevel';
import * as UsbNode from 'usb';

interface PromisifiedDevice extends UsbNode.Device {
  getStringDescriptorAsync(id: number): Promise<string | undefined>;
}

const usb = Bluebird.promisifyAll(UsbNode);

type Device = import('../common/device/types').Device;

class UsbEventEmitter extends EventEmitter {}

const emitter = new UsbEventEmitter();

function devicePath(device: UsbNode.Device): string {
  return device.portNumbers ? `${device.busNumber}-${device.portNumbers.join('.')}` : device.busNumber.toString();
}

function createMinDevice(raw: UsbNode.Device, connected: boolean): Device {
  const desc = raw.deviceDescriptor;

  return {
    raw: raw,
    connected: connected,
    openable: false,
    busNo: raw.busNumber,
    path: devicePath(raw),
    vendorId: desc.idVendor,
    productId: desc.idProduct,
    manufacturer: undefined,
    product: undefined,
    serialNo: undefined,
    version: desc.bcdDevice,
  };
}

function emitAttach(raw: UsbNode.Device): void {
  const device = createMinDevice(raw, true);
  emitter.emit('attach', device);
}

function emitDetach(raw: UsbNode.Device): void {
  const device = createMinDevice(raw, false);
  emitter.emit('detach', device);
}

usb.on('attach', emitAttach);
usb.on('detach', emitDetach);

/**
 * @param {UsbDevice} device
 * @returns {Boolean}
 */
function safeOpen(device: UsbNode.Device): boolean {
  try {
    device.open();
    return true;
  } catch (e) {
    log.warn(`Could not open device ${devicePath(device)}`, e);
    return false;
  }
}

/**
 * @param {UsbDevice} device
 * @returns {Boolean}
 */
function safeClose(device: UsbNode.Device): boolean {
  try {
    device.close();
    return true;
  } catch (e) {
    log.warn(`Could not close device ${devicePath(device)}`, e);
    return false;
  }
}

export function getAttachedDevices(): Device[] {
  return usb.getDeviceList().map((d: UsbNode.Device) => createMinDevice(d, true));
}

export async function getDeviceDetails(device: Device): Promise<Device> {
  const raw = device.raw as PromisifiedDevice;
  const desc = device.raw.deviceDescriptor;

  device.openable = device.connected && safeOpen(raw);
  if (!device.openable) {
    return device;
  }

  function getString(id: number): Promise<string | undefined> {
    return id ? raw.getStringDescriptorAsync(id) : Promise.resolve(undefined);
  }

  try {
    const [mfg, prod, serial] = await Bluebird.all([
      getString(desc.iManufacturer),
      getString(desc.iProduct),
      getString(desc.iSerialNumber),
    ]);

    return { ...device, ...{ manufacturer: mfg, product: prod, serialNo: serial } };
  } finally {
    safeClose(raw);
  }
}

export function on(event: 'attach' | 'detach', callback: (device: Device) => void): void {
  emitter.on(event, callback);
}

export function off(event: 'attach' | 'detach', callback: (device: Device) => void): void {
  emitter.removeListener(event, callback);
}

export function once(event: 'attach' | 'detach', callback: (device: Device) => void): void {
  emitter.once(event, callback);
}
