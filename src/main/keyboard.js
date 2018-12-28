import { getDeviceDetails } from './usb';
import { getDevice, keyboards } from '../common/device/keyboard';

/**
 * @param {import('../common/device/types').Device} usb
 * @returns {Promise<import('../common/device/types').Keyboard>}
 */
export async function identifyKeyboard(usb) {
  const device = getDevice(usb);

  if (device.isUnique) {
    let keyboard = keyboards.find(x => x.display === device.names[0]);
    return keyboard;
  }

  const detail = await getDeviceDetails(usb);

  if (!detail.openable) {
    return null;
  }

  let keyboard = keyboards.find(x => !!x.names.find(y => detail.product.includes(y)));

  return keyboard;
}
