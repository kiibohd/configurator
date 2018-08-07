import Promise from 'bluebird';
import EventEmitter from 'events';

const usb = Promise.promisifyAll(require('usb'));

class UsbEventEmitter extends EventEmitter {}

const emitter = new UsbEventEmitter();

usb.on('attach', emitAttach);
usb.on('detach', emitDetach);

function emitAttach(raw) {
  const device = createMinDevice(raw, true);
  emitter.emit('attach', device);
}

function emitDetach(raw) {
  const device = createMinDevice(raw, false);
  emitter.emit('detach', device);
}

function devicePath(device) {
  return device.portNumbers ? `${device.busNumber}-${device.portNumbers.join('.')}` : device.busNumber.toString();
}

function safeOpen(device) {
  try {
    device.open();
    return true;
  } catch (e) {
    console.warn(`Could not open device ${devicePath(device)}`, e);
    return false;
  }
}

function safeClose(device) {
  try {
    device.close();
    return true;
  } catch (e) {
    console.warn(`Could not close device ${devicePath(device)}`, e);
    return false;
  }
}

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

export function getAttachedDevices() {
  return usb.getDeviceList().map(d => createMinDevice(d, true));
}

export async function getDeviceDetails(device) {
  const raw = device.raw;
  const desc = device.raw.deviceDescriptor;

  device.openable = device.connected && safeOpen(raw);
  if (!device.openable) {
    return device;
  }
  try {
    const [mfg, prod, serial] = await Promise.all([
      getString(desc.iManufacturer),
      getString(desc.iProduct),
      getString(desc.iSerialNumber)
    ]);

    device.manufacturer = mfg;
    device.product = prod;
    device.serialNo = serial;

    // console.log(device);

    return device;
  } finally {
    safeClose(raw);
  }

  function getString(id) {
    return id ? raw.getStringDescriptorAsync(id) : undefined;
  }
}

export function on(event, callback) {
  emitter.on(event, callback);
}

export function off(event, callback) {
  emitter.off(event, callback);
}

export function once(event, callback) {
  emitter.once(event, callback);
}
