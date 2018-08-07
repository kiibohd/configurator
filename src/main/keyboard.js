import { getDeviceDetails } from './usb';
import { getDevice, keyboards } from '../common/device/keyboard';

export async function identifyKeyboard(usb) {
  const device = getDevice(usb);

  if (device.isUnique) {
    let keyboard = keyboards.find(x => x.display === device.names[0]);
    return keyboard;
  }

  const detail = await getDeviceDetails(usb);

  let keyboard = keyboards.find(x => x.names.find(y => detail.product.includes(y)));

  return keyboard;
}
