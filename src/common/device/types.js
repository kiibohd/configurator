/**
 * @typedef {import('usb').Device} UsbDevice
 */

/**
 * @typedef Device
 * @property {UsbDevice} raw
 * @property {Boolean} connected
 * @property {Boolean} openable
 * @property {Number} busNo
 * @property {string} path
 * @property {Number} vendorId
 * @property {Number} productId
 * @property {String} manufacturer
 * @property {String} product
 * @property {String} serialNo
 */

/**
 * @typedef KnownDevice
 * @property {Number} vid
 * @property {Number} pid
 * @property {Boolean} isFlashable
 * @property {Boolean} isUnique
 * @property {String[]} names
 * @property {string} variant
 */

/**
 * @typedef Keyboard
 * @property {String} display
 * @property {String[]} names
 * @property {String[]} variants
 * @property {Boolean} visuals
 * @property {Object<String, String[]>} layouts
 * @property {{ resetCombo?: string }} info
 */

/**
 * @typedef AttachedKeyboard
 * @property {Keyboard} keyboard
 * @property {KnownDevice} known
 * @property {UsbDevice} raw
 * @property {Boolean} connected
 * @property {Boolean} openable
 * @property {Number} busNo
 * @property {string} path
 * @property {Number} vendorId
 * @property {Number} productId
 * @property {String} manufacturer
 * @property {String} product
 * @property {String} serialNo
 */

//@ts-ignore -- This is a hack to make it an importable module
export const _ = undefined;
