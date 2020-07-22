import { getDeviceDetails } from './usb';
import { getDevice, keyboards } from '../common/device/keyboard';

export async function identifyKeyboard(
  usb: import('../common/device/types').Device
): Promise<import('../common/device/types').Keyboard | null> {
  const device = getDevice(usb);

  if (!device) {
    return null;
  }

  if (device.isUnique) {
    const keyboard = keyboards.find((x) => x.display === device.names[0]);
    return keyboard || null;
  }

  const detail = await getDeviceDetails(usb);

  if (!detail.openable) {
    return null;
  }

  const keyboard = keyboards.find((x) => !!x.names.find((y) => detail.product && detail.product.includes(y)));

  return keyboard || null;
}
