import Bluebird from 'bluebird';
import EventEmitter from 'events';
import log from 'loglevel';

const usb = Bluebird.promisifyAll(require('usb'));

/**
 * @typedef {import('../common/device/types').UsbDevice} UsbDevice
 */
/**
 * @typedef {import('../common/device/types').Device} Device
 */

class UsbEventEmitter extends EventEmitter {}

const emitter = new UsbEventEmitter();

usb.on('attach', emitAttach);
usb.on('detach', emitDetach);

/**
 * @param {UsbDevice} raw
 */
function emitAttach(raw) {
  const device = createMinDevice(raw, true);
  emitter.emit('attach', device);
}

/**
 * @param {import('usb').Device} raw
 */
function emitDetach(raw) {
  const device = createMinDevice(raw, false);
  emitter.emit('detach', device);
}

/**
 * @param {UsbDevice} device
 * @returns {String}
 */
function devicePath(device) {
  return device.portNumbers ? `${device.busNumber}-${device.portNumbers.join('.')}` : device.busNumber.toString();
}

/**
 * @param {UsbDevice} device
 * @returns {Boolean}
 */
function safeOpen(device) {
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
function safeClose(device) {
  try {
    device.close();
    return true;
  } catch (e) {
    log.warn(`Could not close device ${devicePath(device)}`, e);
    return false;
  }
}

/**
 * @param {UsbDevice} raw
 * @param {Boolean} connected
 * @returns {Device}
 */
function createMinDevice(raw, connected) {
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
    serialNo: undefined
  };
}

/**
 * @returns {Device[]}
 */
export function getAttachedDevices() {
  return usb.getDeviceList().map(d => createMinDevice(d, true));
}

/**
 * @param {Device} device
 * @returns {Promise<Device>}
 */
export async function getDeviceDetails(device) {
  const raw = device.raw;
  const desc = device.raw.deviceDescriptor;

  device.openable = device.connected && safeOpen(raw);
  if (!device.openable) {
    return device;
  }
  try {
    const [mfg, prod, serial] = await Bluebird.all([
      getString(desc.iManufacturer),
      getString(desc.iProduct),
      getString(desc.iSerialNumber)
    ]);

    device.manufacturer = mfg;
    device.product = prod;
    device.serialNo = serial;

    return device;
  } finally {
    safeClose(raw);
  }

  function getString(id) {
    //@ts-ignore -- Bluebird adds this at runtime.
    return id ? raw.getStringDescriptorAsync(id) : undefined;
  }
}

/**
 * @param {'attach'|'detach'} event
 * @param {(device: Device) => void} callback
 */
export function on(event, callback) {
  emitter.on(event, callback);
}

/**
 * @param {'attach'|'detach'} event
 * @param {(device: Device) => void} callback
 */
export function off(event, callback) {
  emitter.removeListener(event, callback);
}

/**
 * @param {'attach'|'detach'} event
 * @param {(device: Device) => void} callback
 */
export function once(event, callback) {
  emitter.once(event, callback);
}
